package websocket

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"demodesk/neko/internal/types"
	"demodesk/neko/internal/types/event"
	"demodesk/neko/internal/types/message"
	"demodesk/neko/internal/websocket/handler"
)

func New(
	sessions types.SessionManager,
	desktop types.DesktopManager,
	capture types.CaptureManager,
	webrtc types.WebRTCManager,
) *WebSocketManagerCtx {
	logger := log.With().Str("module", "websocket").Logger()

	return &WebSocketManagerCtx{
		logger:   logger,
		sessions: sessions,
		desktop:  desktop,
		handler:  handler.New(sessions, desktop, capture, webrtc),
		handlers: []types.WebSocketHandler{},
	}
}

// Send pings to peer with this period. Must be less than pongWait.
const pingPeriod = 10 * time.Second

type WebSocketManagerCtx struct {
	logger   zerolog.Logger
	sessions types.SessionManager
	desktop  types.DesktopManager
	handler  *handler.MessageHandlerCtx
	handlers []types.WebSocketHandler
}

func (manager *WebSocketManagerCtx) Start() {
	manager.sessions.OnCreated(func(session types.Session) {
		logger := manager.logger.With().Str("session_id", session.ID()).Logger()

		if err := manager.handler.SessionCreated(session); err != nil {
			logger.Warn().Err(err).Msg("session created with an error")
		} else {
			logger.Debug().Msg("session created")
		}
	})

	manager.sessions.OnDeleted(func(session types.Session) {
		logger := manager.logger.With().Str("session_id", session.ID()).Logger()

		if err := manager.handler.SessionDeleted(session); err != nil {
			logger.Warn().Err(err).Msg("session deleted with an error")
		} else {
			logger.Debug().Msg("session deleted")
		}
	})

	manager.sessions.OnConnected(func(session types.Session) {
		logger := manager.logger.With().Str("session_id", session.ID()).Logger()

		if err := manager.handler.SessionConnected(session); err != nil {
			logger.Warn().Err(err).Msg("session connected with an error")
		} else {
			logger.Debug().Msg("session connected")
		}
	})

	manager.sessions.OnDisconnected(func(session types.Session) {
		logger := manager.logger.With().Str("session_id", session.ID()).Logger()

		if err := manager.handler.SessionDisconnected(session); err != nil {
			logger.Warn().Err(err).Msg("session disconnected with an error")
		} else {
			logger.Debug().Msg("session disconnected")
		}
	})

	manager.sessions.OnProfileChanged(func(session types.Session) {
		logger := manager.logger.With().Str("session_id", session.ID()).Logger()

		if err := manager.handler.SessionProfileChanged(session); err != nil {
			logger.Warn().Err(err).Msg("session profile changed with an error")
		} else {
			logger.Debug().Interface("profile", session.Profile()).Msg("session profile changed")
		}
	})

	manager.sessions.OnStateChanged(func(session types.Session) {
		logger := manager.logger.With().Str("session_id", session.ID()).Logger()

		if err := manager.handler.SessionStateChanged(session); err != nil {
			logger.Warn().Err(err).Msg("session state changed with an error")
		} else {
			logger.Debug().Interface("state", session.State()).Msg("session state changed")
		}
	})

	manager.sessions.OnHostChanged(func(session types.Session) {
		msg := message.ControlHost{
			Event:   event.CONTROL_HOST,
			HasHost: session != nil,
		}

		if msg.HasHost {
			msg.HostID = session.ID()
		}

		manager.sessions.Broadcast(msg, nil)

		manager.logger.Debug().
			Bool("has_host", msg.HasHost).
			Str("host_id", msg.HostID).
			Msg("session host changed")
	})

	manager.desktop.OnClipboardUpdated(func() {
		session := manager.sessions.GetHost()
		if session == nil || !session.Profile().CanAccessClipboard {
			return
		}

		data, err := manager.desktop.ClipboardGetText()
		if err != nil {
			manager.logger.Warn().Err(err).Msg("could not get clipboard content")
			return
		}

		if err := session.Send(message.ClipboardData{
			Event: event.CLIPBOARD_UPDATED,
			Text:  data.Text,
			// TODO: Send HTML?
		}); err != nil {
			manager.logger.Warn().Err(err).Msg("could not sync clipboard")
			return
		}

		manager.logger.Debug().Msg("session sync clipboard")
	})

	manager.fileChooserDialogEvents()

	manager.logger.Info().Msg("websocket starting")
}

func (manager *WebSocketManagerCtx) Shutdown() error {
	manager.logger.Info().Msg("websocket shutdown")
	return nil
}

func (manager *WebSocketManagerCtx) AddHandler(handler types.WebSocketHandler) {
	manager.handlers = append(manager.handlers, handler)
}

func (manager *WebSocketManagerCtx) Upgrade(w http.ResponseWriter, r *http.Request, checkOrigin types.CheckOrigin) {
	// add request data to logger context
	logger := manager.logger.With().
		Str("address", r.RemoteAddr).
		Str("agent", r.UserAgent()).
		Logger()

	logger.Debug().Msg("attempting to upgrade connection")

	upgrader := websocket.Upgrader{
		CheckOrigin: checkOrigin,
	}

	connection, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error().Err(err).Msg("failed to upgrade connection")
		return
	}

	session, err := manager.sessions.Authenticate(r)
	if err != nil {
		logger.Debug().Err(err).Msg("authentication failed")

		// TODO: Refactor, return error code.
		if err = connection.WriteJSON(
			message.SystemDisconnect{
				Event:   event.SYSTEM_DISCONNECT,
				Message: err.Error(),
			}); err != nil {
			logger.Error().Err(err).Msg("failed to send disconnect event")
		}

		if err := connection.Close(); err != nil {
			logger.Warn().Err(err).Msg("connection closed with an error")
		}

		return
	}

	// use session id with defeault logger context
	logger = manager.logger.With().Str("session_id", session.ID()).Logger()

	if !session.Profile().CanConnect {
		logger.Debug().Msg("connection disabled")

		// TODO: Refactor, return error code.
		if err = connection.WriteJSON(
			message.SystemDisconnect{
				Event:   event.SYSTEM_DISCONNECT,
				Message: "connection disabled",
			}); err != nil {
			logger.Error().Err(err).Msg("failed to send disconnect event")
		}

		if err := connection.Close(); err != nil {
			logger.Warn().Err(err).Msg("connection closed with an error")
		}

		return
	}

	if session.State().IsConnected {
		logger.Warn().Msg("already connected")

		if !manager.sessions.MercifulReconnect() {
			// TODO: Refactor, return error code.
			if err = connection.WriteJSON(
				message.SystemDisconnect{
					Event:   event.SYSTEM_DISCONNECT,
					Message: "already connected",
				}); err != nil {
				logger.Error().Err(err).Msg("failed to send disconnect event")
			}

			if err := connection.Close(); err != nil {
				logger.Warn().Err(err).Msg("connection closed with an error")
			}

			return
		}

		logger.Info().Msg("replacing peer connection")

		// destroy previous peer connection
		session.GetWebSocketPeer().Destroy()
	}

	peer := &WebSocketPeerCtx{
		logger:     logger,
		session:    session,
		connection: connection,
	}

	session.SetWebSocketPeer(peer)

	logger.Info().
		Str("address", connection.RemoteAddr().String()).
		Str("agent", r.UserAgent()).
		Msg("connection started")

	session.SetWebSocketConnected(peer, true)

	defer func() {
		logger.Info().
			Str("address", connection.RemoteAddr().String()).
			Str("agent", r.UserAgent()).
			Msg("connection ended")

		session.SetWebSocketConnected(peer, false)
	}()

	manager.handle(connection, session)
}

func (manager *WebSocketManagerCtx) handle(connection *websocket.Conn, session types.Session) {
	// add session id to logger context
	logger := manager.logger.With().Str("session_id", session.ID()).Logger()

	bytes := make(chan []byte)
	cancel := make(chan struct{})

	ticker := time.NewTicker(pingPeriod)
	defer ticker.Stop()

	go func() {
		for {
			_, raw, err := connection.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					logger.Warn().Err(err).Msg("read message error")
				} else {
					logger.Debug().Err(err).Msg("read message error")
				}

				close(cancel)
				break
			}

			bytes <- raw
		}
	}()

	for {
		select {
		case raw := <-bytes:
			data := types.WebSocketMessage{}
			if err := json.Unmarshal(raw, &data); err != nil {
				logger.Error().Err(err).Msg("message parsing has failed")
				break
			}

			// TODO: Switch to payload based messages.
			data.Payload = raw

			logger.Debug().
				Str("address", connection.RemoteAddr().String()).
				Str("event", data.Event).
				Str("payload", string(data.Payload)).
				Msg("received message from client")

			handled := manager.handler.Message(session, data)
			for _, handler := range manager.handlers {
				if handled {
					break
				}

				handled = handler(session, data)
			}

			if !handled {
				logger.Warn().Str("event", data.Event).Msg("unhandled message")
			}
		case <-cancel:
			return
		case <-ticker.C:
			if err := connection.WriteMessage(websocket.PingMessage, nil); err != nil {
				logger.Error().Err(err).Msg("ping message has failed")
				return
			}
		}
	}
}

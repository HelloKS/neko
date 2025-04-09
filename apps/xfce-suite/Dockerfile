ARG BASE_IMAGE=m1k1o/neko:base
FROM $BASE_IMAGE

#
# install xfce
RUN set -eux; \
    # install firefox repository
    wget -q https://packages.mozilla.org/apt/repo-signing-key.gpg -O- | tee /etc/apt/keyrings/packages.mozilla.org.asc; \
    echo "deb [signed-by=/etc/apt/keyrings/packages.mozilla.org.asc] https://packages.mozilla.org/apt mozilla main" | tee -a /etc/apt/sources.list.d/mozilla.list; \
    echo ' \
Package: * \
Pin: origin packages.mozilla.org \
Pin-Priority: 1000 \
' | tee /etc/apt/preferences.d/mozilla; \
    apt-get update; \
    apt-get install -y --no-install-recommends xfce4 xfce4-terminal papirus-icon-theme sudo locales \
    vlc firefox; \
    # add user to sudoers
    usermod -aG sudo neko; \
    echo "neko:neko" | chpasswd; \
    echo "%sudo ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers; \
	# ko-KR
    localedef -f UTF-8 -i ko_KR ko_KR.UTF-8; \
    apt-get install firefox-l10n-ko vlc-l10n; \
    # clean up
    apt-get clean -y; \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*

# Specify locale
ENV LC_ALL=ko_KR.UTF-8
ENV LANG=ko_KR.UTF-8

#
# copy configuation files
COPY supervisord.conf /etc/neko/supervisord/xfce.conf


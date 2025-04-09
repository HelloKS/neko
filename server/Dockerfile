ARG BASE_IMAGE=golang:1.21-bookworm
FROM $BASE_IMAGE AS server

WORKDIR /src

COPY ./gst-bin.tar.gz /src/gst-bin.tar.gz

#
# install dependencies
ENV DEBIAN_FRONTEND=noninteractive
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        libx11-dev libxrandr-dev libxtst-dev libsndfile1 libglib2.0-dev libunwind8-dev libdw-dev libxfixes-dev libgtk-3-dev libxcvt-dev; \
    #
    # clean up
    apt-get clean -y; \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*; \
    #
    # extract custom gstreamer
    tar xzf /src/gst-bin.tar.gz --directory=/opt/; \
    rm -rf /src/gst-bin.tar.gz

ARG GIT_COMMIT
ARG GIT_BRANCH
ARG GIT_TAG

ENV PATH="${PATH}:/opt/gst-bin/bin"
ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/opt/gst-bin/lib/x86_64-linux-gnu"
ENV LIBRARY_PATH="${LIBRARY_PATH}:/opt/gst-bin/lib/x86_64-linux-gnu"
ENV PKG_CONFIG_PATH="${PKG_CONFIG_PATH}:/opt/gst-bin/lib/x86_64-linux-gnu/pkgconfig"
ENV CPLUS_INCLUDE_PATH="${CPLUS_INCLUDE_PATH}:/opt/gst-bin/include/gstreamer-1.0"
ENV C_INCLUDE_PATH="${C_INCLUDE_PATH}:/opt/gst-bin/include/gstreamer-1.0"
ENV GST_PLUGIN_PATH=/opt/gst-bin/lib/x86_64-linux-gnu/gstreamer-1.0
ENV GST_PLUGIN_SCANNER=/opt/gst-bin/libexec/gstreamer-1.0/gst-plugin-scanner
ENV GI_TYPELIB_PATH=/opt/gst-bin/lib/x86_64-linux-gnu/girepository-1.0/

#
# build server
COPY . .
RUN ./build

#
# artifacts from this stage
# COPY --from=server /src/bin/plugins/ $NEKO_PLUGINS_DIR
# COPY --from=server /src/bin/neko /usr/bin/neko

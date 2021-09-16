FROM caddy:2-builder AS builder

# 16/09/2021
RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare@91cf700 

FROM alpine

ENV XDG_CONFIG_HOME=/config
ENV XDG_DATA_HOME=/data

VOLUME /config
VOLUME /data

EXPOSE 80
EXPOSE 443
EXPOSE 2019

RUN apk add --no-cache ca-certificates mailcap
COPY --from=builder /usr/bin/caddy /usr/bin/caddy

FROM caddy:2.7-builder AS builder

RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare@a9d3ae2690a1d2 \
    --with github.com/adamburgess/caddy-ext/layer4@e3d9aa27

FROM scratch

COPY --from=builder /usr/bin/caddy /caddy

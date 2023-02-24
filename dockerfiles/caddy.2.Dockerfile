FROM caddy:2-builder AS builder

RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare@ed330a80 \
    --with github.com/RussellLuo/caddy-ext/layer4@3497b196
#    --with github.com/mholt/caddy-l4@99bc69cc
#    --with github.com/adamburgess/caddy-admin-adapt@95ae89e

FROM scratch

COPY --from=builder /usr/bin/caddy /caddy

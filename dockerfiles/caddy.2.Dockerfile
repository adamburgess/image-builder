FROM caddy:2-builder AS builder

RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare@91cf700
#    --with github.com/mholt/caddy-l4@31d74d3 \
#    --with github.com/adamburgess/caddy-admin-adapt@95ae89e

FROM scratch

COPY --from=builder /usr/bin/caddy /caddy

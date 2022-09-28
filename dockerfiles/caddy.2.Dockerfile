FROM caddy:2-builder AS builder

RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare@815abbf \
    --with github.com/mholt/caddy-l4@22431f8
#    --with github.com/adamburgess/caddy-admin-adapt@95ae89e

FROM scratch

COPY --from=builder /usr/bin/caddy /caddy

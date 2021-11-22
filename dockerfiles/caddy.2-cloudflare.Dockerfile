FROM caddy:2-builder AS builder

# 16/09/2021
RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare@91cf700 

FROM scratch

COPY --from=builder /usr/bin/caddy /caddy

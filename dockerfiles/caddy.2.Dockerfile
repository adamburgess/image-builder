FROM caddy:2-builder AS builder

RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare@89f16b99c18ef49c8bb470a82f895bce01cbaece \
    --with github.com/adamburgess/caddy-ext/layer4@e3d9aa27 \
    --with github.com/aksdb/caddy-cgi/v2@1007290b4939ba90b9235505783b84a93c0ec04b
#    --with github.com/mholt/caddy-l4@99bc69cc
#    --with github.com/adamburgess/caddy-admin-adapt@95ae89e

FROM scratch

COPY --from=builder /usr/bin/caddy /caddy
ENTRYPOINT ["/caddy"]

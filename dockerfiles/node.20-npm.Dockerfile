from aburgess/common:latest as nrr

run apk add --no-cache unzip

arg TARGETARCH
arg NRR_VERSION=v0.9.2
arg NRR_PREFIX=https://github.com/ryanccn/nrr/releases/download/${NRR_VERSION}/nrr-
arg NRR_SUFFIX=-unknown-linux-musl.zip

run [ $TARGETARCH == "arm64" ] && TARGETARCH="aarch64" || TARGETARCH="x86_64"; wget -q --no-hsts $NRR_PREFIX$TARGETARCH$NRR_SUFFIX; unzip -j nrr*.zip; rm nrr*.zip; chmod +x /nrr

from aburgess/node:20

run --mount=from=nrr,source=/nrr,target=/nrr apk add --no-cache npm git && npm install -g npm && npm install -g yarn pnpm && pnpm config set script-shell /bin/bash && cp /nrr /usr/bin/nrr && alias nr=nrr

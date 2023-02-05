from aburgess/common:latest as builder

arg TARGETARCH
arg BUN_VERSION=v0.5.5
arg BUN_PREFIX=https://github.com/oven-sh/bun/releases/download/bun-$BUN_VERSION/bun-linux-

run if [ $TARGETARCH == "amd64" ]; then x="x64-baseline"; else x="aarch64"; fi; BUN_URL="$BUN_PREFIX$x.zip"; wget --no-hsts $BUN_URL; unzip -j bun*.zip; rm bun*.zip

from ubuntu:22.04

copy --from=builder /bun /usr/bin/bun

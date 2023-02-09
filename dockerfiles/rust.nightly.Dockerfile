from alpine:3.17 as build

# Installs rust and updates the index. Once sparse indexes become normal, remove the steps.
run apk add --no-cache rustup musl-dev build-base && \
    rustup-init --default-toolchain nightly --profile minimal -y && \
    . ~/.cargo/env && \
    cargo search --limit 0
ENV PATH="/root/.cargo/bin:$PATH"

from aburgess/gcc

# Installs rust and updates the index. Once sparse indexes become normal, remove the steps.
run apk add --no-cache rustup && \
    rustup-init --default-toolchain nightly --profile minimal -y && \
    . ~/.cargo/env && \
    cargo new dummy && cd dummy && cargo add empty && cd .. && rm -rf dummy

from aburgess/common:extra

run apk add --no-cache build-base linux-headers openssl-dev

ARG cmake=v3.16.0-rc3

run git clone --single-branch --branch $cmake https://github.com/Kitware/CMake.git && \
    cd CMake && \
    ./bootstrap --parallel=4 && make -j4 && \
    make install && \
    cd .. && rm -rf CMake

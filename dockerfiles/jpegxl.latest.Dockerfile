from ubuntu as build

run apt-get update
env DEBIAN_FRONTEND="noninteractive"
run apt-get install -y git \
    cmake clang libgif-dev libjpeg-dev ninja-build libgoogle-perftools-dev \
    extra-cmake-modules pkg-config libwebp-dev libpng-dev libopenexr-dev doxygen
run git clone https://gitlab.com/wg1/jpeg-xl.git  --recursive
workdir /jpeg-xl
run SKIP_TEST=1 ./ci.sh release
run ldd build/tools/cjxl

from ubuntu

run apt-get update && \
    apt-get install -y libjpeg8 libgif7 libpng16-16 openexr libgoogle-perftools4 && \
    rm -rf /var/lib/apt/lists/*

copy --from=build /jpeg-xl/build/tools/cjxl /jpeg-xl/build/tools/djxl /

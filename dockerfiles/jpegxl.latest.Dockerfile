from ubuntu as build

run apt-get update
env DEBIAN_FRONTEND="noninteractive"
run apt-get install -y git \
    cmake clang libgif-dev libjpeg-dev ninja-build libgoogle-perftools-dev \
    extra-cmake-modules pkg-config libwebp-dev libpng-dev libopenexr-dev
run git clone https://gitlab.com/wg1/jpeg-xl.git --recursive
workdir /jpeg-xl
run sed -i 's/-- all doc/-- cjxl djxl/' ci.sh
run SKIP_TEST=1 ./ci.sh release

from ubuntu

run apt-get update && \
    apt-get install -y libjpeg8 libgif7 libpng16-16 openexr libgoogle-perftools4 && \
    rm -rf /var/lib/apt/lists/*

copy --from=build /jpeg-xl/build/tools/cjxl /jpeg-xl/build/tools/djxl /

run ldd /cjxl && ! (ldd cjxl | grep -q "not found")

from ubuntu as build

run apt update
run apt install git -y
run git clone https://gitlab.com/wg1/jpeg-xl.git  --recursive
workdir /jpeg-xl
env DEBIAN_FRONTEND="noninteractive"
run apt install -y cmake clang
run apt install -y libgif-dev libjpeg-dev
run apt install -y ninja-build libgoogle-perftools-dev
run apt install -y extra-cmake-modules
run apt install -y pkg-config
run apt install -y libwebp-dev libpng-dev libopenexr-dev
run apt install -y doxygen
run SKIP_TEST=1 ./ci.sh release
run ldd build/tools/cjxl

from ubuntu

copy --from=build /jpeg-xl/build/tools/cjxl /cjxl
copy --from=build /jpeg-xl/build/tools/djxl /djxl
run apt-get update && \
    apt-get install -y libjpeg8 libgif7 libpng16-16 openexr libgoogle-perftools4 && \
    rm -rf /var/lib/apt/lists/*
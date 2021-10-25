from alpine as builder

run apk add git cmake build-base libjpeg-turbo-static libpng-static zlib-static
run git clone https://github.com/libjxl/libjxl.git
workdir /libjxl
run git submodule update --init --recursive
workdir /libjxl/build
run cmake .. -DJPEGXL_STATIC=ON
run make -j$(($(nproc) + 1)) cjxl djxl

from alpine

copy --from=builder /libjxl/build/tools/cjxl /libjxl/build/tools/djxl /

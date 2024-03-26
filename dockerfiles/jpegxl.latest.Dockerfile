from alpine:3.19 as builder

run apk add git cmake build-base libjpeg-turbo-static libjpeg-turbo-dev libpng-static libpng-dev zlib-static zlib-dev gflags-dev linux-headers
run git clone https://github.com/libjxl/libjxl.git
workdir /libjxl
run git submodule update --init --recursive
workdir /libjxl/build
run cmake .. -DJPEGXL_STATIC=ON
run make -j$(($(nproc) + 1)) cjxl djxl

from alpine:3.19

copy --from=builder /libjxl/build/tools/cjxl /libjxl/build/tools/djxl /

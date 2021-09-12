from aburgess/gcc:latest as build

run apk add --no-cache zlib-dev perl brotli-dev libuv-dev

run git clone --depth 1 https://github.com/h2o/h2o.git
workdir /h2o
run sed -i 's/-g3 //' CMakeLists.txt
run mkdir build && cd build && cmake ..
run cd build && make -j h2o

from aburgess/common:latest

copy --from=build /h2o/build/h2o /bin/h2o

from aburgess/gcc:latest

# GDB
run apk add --no-cache gdb sqlite-dev

# # JsonCpp, a ...
# run git clone --depth 1 https://github.com/open-source-parsers/jsoncpp.git && \
#     cd jsoncpp && \
#     mkdir build && cd build && cmake -DBUILD_STATIC_LIBS=ON -DBUILD_SHARED_LIBS=OFF -DJSONCPP_WITH_TESTS=OFF -DJSONCPP_WITH_POST_BUILD_UNITTEST=OFF -DCMAKE_INSTALL_INCLUDEDIR=include/jsoncpp .. && \
#     make -j$(($(nproc) + 1)) && make install && \
#     cd ../.. && rm -rf jsoncpp

# # fmt, a formatting library
# run git clone --depth 1 --branch 8.0.1 https://github.com/fmtlib/fmt.git && \
#     cd fmt && \
#     mkdir build && cd build && cmake .. -DCMAKE_SKIP_INSTALL_ALL_DEPENDENCY=1 && \
#     make -j$(($(nproc) + 1)) fmt && make install && \
#     cd ../.. && rm -rf fmt

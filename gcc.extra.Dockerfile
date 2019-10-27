from aburgess/gcc:latest

# GDB
run apk add --no-cache gdb

# CGreen, a testing framework
run ln -s /usr/local/lib /usr/local/lib64 && \
    git clone https://github.com/cgreen-devs/cgreen.git && \
    cd cgreen && \
    make -j && \
    sudo make install && \
    cd .. && rm -rf cgreen

# Pistache, a C++ web server
run git clone https://github.com/oktal/pistache.git && \
    cd pistache && \
    mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=Release .. && make -j && make install && \
    cd ../.. && rm -rf pistache

# JsonCpp, a ...

run git clone https://github.com/open-source-parsers/jsoncpp.git && \
    cd jsoncpp && \
    mkdir build && cd build && cmake -DBUILD_STATIC_LIBS=ON -DBUILD_SHARED_LIBS=ON -DCMAKE_INSTALL_INCLUDEDIR=include/jsoncpp .. && \
    make -j && make install && \
    cd ../.. && rm -rf jsoncpp

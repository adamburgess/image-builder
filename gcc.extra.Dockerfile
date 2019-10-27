from aburgess/gcc:latest

run apk add gdb && \
    ln -s /usr/local/lib /usr/local/lib64 && \
    git clone https://github.com/cgreen-devs/cgreen.git && \
    cd cgreen && \
    make -j && \
    sudo make install && \
    cd .. && rm -rf cgreen

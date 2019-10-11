from docker

run apk add bash ncurses

workdir /builder

add . /builder

entrypoint ./build.sh 

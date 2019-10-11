from docker

run apk add bash ncurses

workdir /builder

add . /builder

env TERM xterm-256color

entrypoint ./build.sh 

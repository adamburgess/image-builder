from docker

workdir /builder

add . /builder

entrypoint ./build.sh 

from alpine

run apk add --no-cache bash curl wget

env TERM xterm-256color

entrypoint [ "/bin/bash" ]
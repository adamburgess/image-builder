from alpine

run apk add --no-cache bash curl wget tini

env TERM xterm-256color

entrypoint [ "/bin/bash" ]
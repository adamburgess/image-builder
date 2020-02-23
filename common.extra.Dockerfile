from aburgess/common:latest

run apk add --no-cache dpkg sudo git rsync openssh-client

env TERM xterm-256color

entrypoint [ "/bin/bash" ]
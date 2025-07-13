from alpine:3.22

run apk add --no-cache bash curl wget htop nano libstdc++ && echo "export PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '" > /root/.bashrc

env TERM=xterm-256color DOCKER=1

shell ["/bin/bash", "-c"]
entrypoint [ "/bin/bash" ]

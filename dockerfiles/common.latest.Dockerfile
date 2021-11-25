from aburgess/binaries:mo as mo
from alpine:3.15

run apk add --no-cache bash curl wget tini htop nano libstdc++

copy --from=mo /mo /bin/mo
copy prompt.sh /root/.bashrc

env TERM xterm-256color

shell ["/bin/bash", "-c"]
entrypoint [ "/bin/bash" ]

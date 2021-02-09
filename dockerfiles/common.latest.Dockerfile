from aburgess/binaries:mo as mo
from alpine

run apk add --no-cache bash curl wget tini htop nano libstdc++

copy --from=mo /mo /bin/mo
copy prompt.sh /root/.bashrc

env TERM xterm-256color

entrypoint [ "/bin/bash" ]

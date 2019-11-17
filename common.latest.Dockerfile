from aburgess/binaries:mo as mo
from alpine

run apk add --no-cache bash curl wget tini htop nano

copy --from=mo /mo /bin/mo

env TERM xterm-256color

entrypoint [ "/bin/bash" ]
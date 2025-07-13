#from aburgess/common

#run apk add --no-cache nodejs-current && [[ `node --version` == v24.* ]]

from scratch as node24

copy --from=node:24-alpine3.22 /usr/local/bin/node /usr/bin/node
copy --from=node:24-alpine3.22 /usr/local/include/node /usr/include/node
copy --from=node:24-alpine3.22 /usr/local/lib/node_modules /usr/lib/node_modules

from aburgess/common

copy --from=node24 /usr /usr

run ln -s ../lib/node_modules/corepack/dist/corepack.js /usr/bin/corepack && \
    ln -s node /usr/bin/nodejs && \
    ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/bin/npm && \
    ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/bin/npx && \
    [[ `node --version` == v24.* ]]

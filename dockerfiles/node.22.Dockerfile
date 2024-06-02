from scratch as node22

copy --from=node:22-alpine3.20 /usr/local/bin/node /usr/bin/node
copy --from=node:22-alpine3.20 /usr/local/include/node /usr/include/node
copy --from=node:22-alpine3.20 /usr/local/lib/node_modules /usr/lib/node_modules

from aburgess/common

copy --from=node22 /usr /usr

run ln -s ../lib/node_modules/corepack/dist/corepack.js /usr/bin/corepack && \
    ln -s node /usr/bin/nodejs && \
    ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/bin/npm && \
    ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/bin/npx && \
    [[ `node --version` == v22.* ]]

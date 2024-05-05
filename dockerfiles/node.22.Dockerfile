from scratch as node22

copy --from=node:22-alpine3.19 /usr/local/bin/node /usr/local/bin/node
copy --from=node:22-alpine3.19 /usr/local/include/node /usr/local/include/node
copy --from=node:22-alpine3.19 /usr/local/lib/node_modules /usr/local/lib/node_modules

from aburgess/common

copy --from=node22 /usr/local /usr/local

run ln -s ../lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack && \
    ln -s node /usr/local/bin/nodejs && \
    ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx && \
    [[ `node --version` == v22.* ]]

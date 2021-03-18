from aburgess/node:lts

run apk add --no-cache npm git && npm install -g npm && npm install -g yarn pnpm && pnpm config set script-shell /bin/bash
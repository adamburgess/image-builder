from aburgess/node:latest

run apk add --no-cache npm git jq && npm install -g npm && npm install -g yarn pnpm @adamburgess/nr && pnpm config set script-shell /bin/bash

from aburgess/node:22

run apk add --no-cache git jq && npm install -g npm && npm install -g pnpm @adamburgess/nr && pnpm config set script-shell /bin/bash

from aburgess/common:extra as build

run apk add --no-cache python3 build-base py3-pip python3-dev libffi-dev
run git clone --depth 1 --branch 1.7.0-Beta1 https://github.com/Syncplay/syncplay.git
WORKDIR /syncplay
run python3 -m venv environment
run source environment/bin/activate && pip3 install -U wheel
run source environment/bin/activate && pip3 install -r requirements.txt

from aburgess/common:latest
run apk add --no-cache python3 libffi
workdir /syncplay
copy --from=build /syncplay/environment/ /syncplay/environment/
copy --from=build /syncplay/syncplayServer.py /syncplay/
copy --from=build /syncplay/syncplay/ /syncplay/syncplay/

env PATH=/syncplay/environment:$PATH

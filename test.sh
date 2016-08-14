#!/bin/sh
set -e


test -e var/schema/address.json \
	|| wget https://raw.githubusercontent.com/json-schema/json-schema/master/draft-03/examples/address -O var/schema/address.json

test -e var/address.json \
	|| wget https://bitbucket.org/robla/jsonwidget-python/raw/72cff07d8caf17b1d116af5982b238be3807b4ea/examples/data/address.json -O var/address.json

test -e var/simpleaddr.json \
	|| wget https://bitbucket.org/robla/jsonwidget-python/raw/72cff07d8caf17b1d116af5982b238be3807b4ea/examples/data/simpleaddr.json -O var/simpleaddr.json



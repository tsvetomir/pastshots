#!/bin/bash

set -e

# run http server to serve markup pages
./../node_modules/.bin/http-server -p 8081 ./pages/ &
HTTP_SERVER=$! # store server PID for later

# collect screenshots
./../index.js --output ./output/ --host http://localhost:8081/ ./pages.json

# stop the http server
kill -9 $HTTP_SERVER

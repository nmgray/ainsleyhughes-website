#!/bin/sh
set -eu

mkdir -p /data/uploads
chown -R node:node /data

exec su-exec node "$@"

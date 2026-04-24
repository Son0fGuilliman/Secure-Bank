#!/bin/sh
set -e

echo "Running prisma migrations..."
npx prisma migrate deploy

echo "Starting Securebank API..."
export NODE_OPTIONS="--dns-result-order=ipv4first"
exec node dist/src/app.js
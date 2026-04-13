#!/bin/sh
set -e

echo "Running prisma migrations..."
npx prisma migrate deploy

echo "Starting Securebank API..."
exec node dist/src/app.js
#!/bin/sh
set -e

echo "🚀 Deploying database migrations..."
npx prisma migrate deploy

echo "🌱 Starting Express application server..."
exec "$@"

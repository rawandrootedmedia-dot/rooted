#!/bin/sh
set -e

echo "Running database migration..."
npx --yes prisma@5 db push --accept-data-loss --skip-generate 2>&1
echo "Migration complete."

exec "$@"

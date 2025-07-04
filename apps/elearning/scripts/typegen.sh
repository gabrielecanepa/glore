#!/usr/bin/env sh

SCHEMA=auth,public,storage
TYPES=supabase/types.ts
arg="--local"

[ -f .env ] && . .env

if [ -z "$SUPABASE_DB_URL" ]; then
  echo "Error: SUPABASE_DB_URL is not set"
  exit 1
fi

SUPABASE_PROJECT_ID=$(echo "$SUPABASE_DB_URL" | sed -E 's|.*@db\.([^.]+)\.supabase\.co:5432/postgres|\1|')

if [ "$ENV" = "production" ] || [ "$NODE_ENV" = "production" ] || [ "$GITHUB_ACTIONS" = "true" ] || [ "$CI" = "true" ] || [ "$CI" = 1 ]; then
  arg="--project-id=$SUPABASE_PROJECT_ID"
fi

if ./node_modules/.bin/supabase gen types typescript --schema $SCHEMA "$arg" > $TYPES; then
  echo "Finished types generation."
fi

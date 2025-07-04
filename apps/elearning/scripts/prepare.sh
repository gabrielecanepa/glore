#!/usr/bin/env sh

[ -f .env ] && . .env

if [ -z "$SUPABASE_ACCESS_TOKEN" ] || [ -z "$SUPABASE_DB_URL" ]; then
  echo "Error: Missing Supabase environment variables"
  exit 1
fi

SUPABASE_PROJECT_ID=$(echo "$SUPABASE_DB_URL" | sed -E 's|.*@db\.([^.]+)\.supabase\.co:5432/postgres|\1|')
SUPABASE_DB_PASSWORD=$(echo "$SUPABASE_DB_URL" | sed -E 's|postgresql://postgres:(.*)@db\..*|\1|')

./node_modules/.bin/supabase login --token "$SUPABASE_ACCESS_TOKEN" >/dev/null
./node_modules/.bin/supabase link --project-ref "$SUPABASE_PROJECT_ID" --password "$SUPABASE_DB_PASSWORD" >/dev/null 2>&1
sh ./scripts/typegen.sh
exit=$?

if [ "$ENV" = "production" ] || [ "$NODE_ENV" = "production" ] || [ "$GITHUB_ACTIONS" = "true" ] || [ "$CI" = "true" ] || [ "$CI" = 1 ]; then
  exit $exit
fi

./node_modules/.bin/supabase start >/dev/null 2>&1
./node_modules/.bin/snaplet-seed init supabase >/dev/null 2>&1

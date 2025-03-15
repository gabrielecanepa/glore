#!/bin/bash

[ "$VERCEL_ENV" != "production" ] && exit 1

release=$(git describe --tags --abbrev=0 --match "v*" 2>/dev/null)
release_commit=$(git rev-list -n 1 "$release" 2>/dev/null)

if [ "$VERCEL_GIT_COMMIT_REF" != "$release_commit" ]; then
  echo "Latest release is already deployed. Skipping build."
  exit 0
fi

exit 1

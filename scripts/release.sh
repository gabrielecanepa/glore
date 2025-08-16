#!/usr/bin/env sh

CHANGELOG=CHANGELOG.md

cmd=$1

case $cmd in
  format)
    prettier --write $CHANGELOG
    [ -n "$(git status --porcelain $CHANGELOG)" ] && git add $CHANGELOG
    ;;
  validate)
    [ -z "$(git log "@{u}..")" ] || [ "$SKIP_CI" = 0 ] && exit 0
    pnpm run build && pnpm run check
    ;;  
esac


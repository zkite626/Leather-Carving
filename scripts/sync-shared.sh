#!/bin/bash
# scripts/sync-shared.sh
# 将 shared/ 同步到 frontend/src/shared 和 backend/src/shared

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# 清理旧的同步目录
rm -rf "$ROOT_DIR/frontend/src/shared"
rm -rf "$ROOT_DIR/backend/src/shared"

# 同步到前端
mkdir -p "$ROOT_DIR/frontend/src/shared/types"
mkdir -p "$ROOT_DIR/frontend/src/shared/validators"
mkdir -p "$ROOT_DIR/frontend/src/shared/utils"
cp -r "$ROOT_DIR/shared/types/"* "$ROOT_DIR/frontend/src/shared/types/"
cp -r "$ROOT_DIR/shared/validators/"* "$ROOT_DIR/frontend/src/shared/validators/"
cp -r "$ROOT_DIR/shared/utils/"* "$ROOT_DIR/frontend/src/shared/utils/"

# 同步到后端
mkdir -p "$ROOT_DIR/backend/src/shared/types"
mkdir -p "$ROOT_DIR/backend/src/shared/validators"
mkdir -p "$ROOT_DIR/backend/src/shared/utils"
cp -r "$ROOT_DIR/shared/types/"* "$ROOT_DIR/backend/src/shared/types/"
cp -r "$ROOT_DIR/shared/validators/"* "$ROOT_DIR/backend/src/shared/validators/"
cp -r "$ROOT_DIR/shared/utils/"* "$ROOT_DIR/backend/src/shared/utils/"

echo "✅ shared 代码已同步到 frontend 和 backend"

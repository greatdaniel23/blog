#!/bin/bash
# Alpha Digital Agency — Clean Deploy Pipeline
# Rule: commit → push → build → deploy (NO dirty deploys)
# Usage: bash deploy.sh [production|preview]
#
# Requires: git, npx (wrangler), node
# API token from D:\multiple-agentic\.env or environment variable

set -euo pipefail

PROJECT_NAME="blogtemplate"
CF_ACCOUNT_ID="b2a5cc3520b42302ad302f7a4790fbee"
ENVIRONMENT="${1:-production}"

echo "=========================================="
echo "  ALPHA DIGITAL — Clean Deploy Pipeline"
echo "  Project: $PROJECT_NAME"
echo "  Environment: $ENVIRONMENT"
echo "  Rule: DEPLOY FROM GIT ONLY (origin/main)"
echo "=========================================="

# ── Gate 1: Fetch latest from origin ────────────
echo ""
echo "[1/5] Fetching latest from origin..."
git fetch origin
REMOTE=$(git rev-parse origin/main)
echo "✅ origin/main = $REMOTE"

# ── Gate 2: Hard reset to origin/main ───────────
echo ""
echo "[2/5] Hard resetting to origin/main (discarding ALL local changes)..."
git reset --hard origin/main
git clean -fd

COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%s)
echo "📦 Deploying from git: $COMMIT_HASH — $COMMIT_MSG"

# ── Gate 3: API token check ─────────────────────
echo ""
echo "[3/5] Checking Cloudflare API token..."
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
    # Try to load from .env in parent directory
    ENV_FILE="../../.env"
    if [ -f "$ENV_FILE" ]; then
        echo "📄 Loading CLOUDFLARE_API_TOKEN from $ENV_FILE"
        export CLOUDFLARE_API_TOKEN=$(grep '^CLOUDFLARE_API_TOKEN=' "$ENV_FILE" | head -1 | cut -d'=' -f2-)
    fi
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
    echo "❌ FAIL: CLOUDFLARE_API_TOKEN not set."
    echo "Set it in your environment or in D:\\multiple-agentic\\.env"
    exit 1
fi
echo "✅ API token loaded."

# ── Gate 4: Build ───────────────────────────────
echo ""
echo "[4/5] Building Astro..."
npx astro build
echo "✅ Build complete."

# ── Gate 5: Deploy ──────────────────────────────
echo ""
echo "[5/5] Deploying to Cloudflare Pages..."
CLOUDFLARE_ACCOUNT_ID=$CF_ACCOUNT_ID \
  npx wrangler pages deploy dist \
    --project-name "$PROJECT_NAME" \
    --branch main \
    --commit-hash "$COMMIT_HASH"

echo ""
echo "=========================================="
echo "  ✅ DEPLOY COMPLETE"
echo "  Commit: $COMMIT_HASH"
echo "  Message: $COMMIT_MSG"
echo "  Preview: https://$COMMIT_HASH.$PROJECT_NAME.pages.dev"
echo "  Live: https://alphadigitalagency.id"
echo "=========================================="

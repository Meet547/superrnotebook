#!/bin/bash
# 
# SuperrBook Database Setup Script
# Run this to apply all missing tables to your Supabase project.
# 
# Usage:
#   SUPABASE_DB_URL="postgresql://postgres:[YOUR-DB-PASSWORD]@db.yqjbfdcyenpzrvjasrmq.supabase.co:5432/postgres" \
#   bash database/run_schema.sh

set -e

if [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Error: SUPABASE_DB_URL is not set."
  echo ""
  echo "Set it like this:"
  echo "  export SUPABASE_DB_URL=\"postgresql://postgres:[YOUR-PASSWORD]@db.yqjbfdcyenpzrvjasrmq.supabase.co:5432/postgres\""
  echo ""
  echo "Find your DB password in: Supabase Dashboard → Project Settings → Database → Connection string"
  exit 1
fi

echo "🚀 Applying SuperrBook schema to Supabase..."
psql "$SUPABASE_DB_URL" -f "$(dirname "$0")/migration.sql" && echo "✅ Schema applied successfully!" || echo "❌ Schema application failed. Check errors above."

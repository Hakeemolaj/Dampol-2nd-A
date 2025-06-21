#!/bin/bash

# Supabase Type Generation Script
# This script generates TypeScript types from your Supabase database schema

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Supabase Type Generation Script${NC}"
echo "=================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed${NC}"
    echo "Please install it first:"
    echo "npm install -g supabase"
    echo "or"
    echo "brew install supabase/tap/supabase"
    exit 1
fi

# Check if .env file exists and has required variables
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Please create a .env file with your Supabase project details"
    exit 1
fi

# Source environment variables
source .env

# Check for required environment variables
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_PROJECT_ID not found in .env${NC}"
    echo "Please add your Supabase project ID to .env:"
    echo "SUPABASE_PROJECT_ID=your-project-id"
    echo ""
    echo "You can find your project ID in the Supabase dashboard URL:"
    echo "https://app.supabase.com/project/YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}📡 Generating types for project: $SUPABASE_PROJECT_ID${NC}"

# Generate types for backend
echo -e "${YELLOW}🔄 Generating backend types...${NC}"
supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > backend/src/config/database.types.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend types generated successfully${NC}"
else
    echo -e "${RED}❌ Failed to generate backend types${NC}"
    exit 1
fi

# Generate types for frontend
echo -e "${YELLOW}🔄 Generating frontend types...${NC}"
supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > frontend/src/lib/database.types.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend types generated successfully${NC}"
else
    echo -e "${RED}❌ Failed to generate frontend types${NC}"
    exit 1
fi

# Add header comment to generated files
add_header() {
    local file=$1
    local temp_file=$(mktemp)
    
    cat > "$temp_file" << EOF
// Auto-generated database types for Supabase
// This file was generated on $(date)
// Run 'npm run generate-types' to regenerate

EOF
    
    cat "$file" >> "$temp_file"
    mv "$temp_file" "$file"
}

echo -e "${YELLOW}📝 Adding headers to generated files...${NC}"
add_header "backend/src/config/database.types.ts"
add_header "frontend/src/lib/database.types.ts"

echo -e "${GREEN}🎉 Type generation completed successfully!${NC}"
echo ""
echo "Generated files:"
echo "  - backend/src/config/database.types.ts"
echo "  - frontend/src/lib/database.types.ts"
echo ""
echo "Next steps:"
echo "1. Review the generated types"
echo "2. Update your imports if needed"
echo "3. Restart your development servers"
echo ""
echo -e "${YELLOW}💡 Tip: Run this script whenever you update your database schema${NC}"

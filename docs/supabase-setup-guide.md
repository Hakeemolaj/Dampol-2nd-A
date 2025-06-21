# Supabase Setup Guide for Barangay Web Application

This guide will help you set up Supabase for the Barangay Web Application.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available)
- Git repository cloned locally

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in/create an account
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `barangay-dampol-2nd-a` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the closest region to your users (e.g., Southeast Asia)
5. Click "Create new project"
6. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

## Step 3: Configure Environment Variables

### Backend Configuration

1. Copy `backend/.env.example` to `backend/.env`
2. Update the following variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
```

### Frontend Configuration

1. Copy `frontend/.env.example` to `frontend/.env.local`
2. Update the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/database-schema-design.sql`
3. Paste it into the SQL Editor and run it
4. This will create all necessary tables and relationships

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`
3. Enable email confirmations if desired
4. Configure email templates under **Auth** > **Templates**

## Step 6: Set Up Row Level Security (RLS)

Run the following SQL commands in the SQL Editor to enable RLS:

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Residents: Users can view their own resident record
CREATE POLICY "Users can view own resident record" ON residents
  FOR SELECT USING (auth.uid() = user_id);

-- Announcements: All authenticated users can view published announcements
CREATE POLICY "Anyone can view published announcements" ON announcements
  FOR SELECT USING (is_published = true);

-- Document requests: Users can only access their own requests
CREATE POLICY "Users can view own document requests" ON document_requests
  FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Users can create document requests" ON document_requests
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);
```

## Step 7: Configure Storage (Optional)

If you plan to handle file uploads:

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `documents`
3. Set up storage policies for file access

## Step 8: Install Dependencies and Start Development

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Start the development servers:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Step 9: Test the Integration

1. Open `http://localhost:3000` in your browser
2. Try registering a new account
3. Check if data appears in your Supabase dashboard under **Authentication** > **Users**
4. Test the announcements API at `http://localhost:3002/api/v1/announcements`

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check your environment variables
   - Ensure you're using the correct keys (anon vs service_role)

2. **CORS errors**
   - Check that your frontend URL is correctly configured in Supabase settings
   - Verify CORS_ORIGIN in your backend .env file

3. **Database connection issues**
   - Verify your Supabase URL is correct
   - Check if your project is paused (free tier projects pause after inactivity)

4. **RLS policy errors**
   - Make sure RLS policies are correctly set up
   - Check that users are properly authenticated

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the application logs in the browser console and terminal
- Check the Supabase dashboard for error logs

## Production Deployment

When deploying to production:

1. Update environment variables with production URLs
2. Configure proper CORS settings
3. Set up proper backup and monitoring
4. Review and tighten RLS policies
5. Enable additional security features as needed

## Next Steps

After successful setup:

1. Customize the database schema for your specific barangay needs
2. Set up additional authentication providers if needed
3. Configure email templates and notifications
4. Set up proper backup and disaster recovery procedures
5. Implement additional security measures for production use

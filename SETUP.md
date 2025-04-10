# LoanX.ai Demo Setup Guide

This guide will help you set up the LoanX.ai demo application with Supabase and OpenAI integration.

## Prerequisites

1. A Supabase account
2. An OpenAI API key
3. Node.js and npm installed

## Step 1: Supabase Setup

1. Log in to [Supabase](https://supabase.com)
2. Navigate to your project `agent-demo` (ID: hhpcissnpzvrxokiazbh)
3. Create database tables by executing the SQL in `supabase-setup.sql`
   - Go to SQL Editor in Supabase
   - Copy and paste the contents of `supabase-setup.sql`
   - Run the SQL statements

4. Create a storage bucket
   - Go to Storage in Supabase
   - Create a new bucket named `repc_documents`
   - Set it to private

## Step 2: Environment Setup

1. Ensure your `.env.local` file has the following:

```
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://hhpcissnpzvrxokiazbh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocGNpc3NucHp2cnhva2lhemJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDI2NzUsImV4cCI6MjA1OTg3ODY3NX0.D11eb7YvbFvCHDBcK8WemUd52TYTufRrPzCeh9MPQjs

# OpenAI API key (replace with your actual key)
OPENAI_API_KEY=your_openai_key_here
```

2. Add your actual OpenAI API key in place of `your_openai_key_here`

## Step 3: Running the Application

1. Install dependencies (if not already done):
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing the Application

1. Upload a PDF REPC document (has to be a PDF)
2. Click "Analyze REPC"
3. The app will:
   - Upload the PDF to Supabase storage
   - Extract text from the PDF
   - Send the text to OpenAI for analysis
   - Store the analysis in Supabase
   - Redirect to the analysis page

## Troubleshooting

- If the PDF upload fails, check the Supabase storage bucket permissions
- If the analysis fails, verify your OpenAI API key is correctly set in `.env.local`
- Check browser console and server logs for detailed error messages 
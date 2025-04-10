-- Create tables for the LoanX.ai application

-- Transactions table to store metadata about uploaded REPCs
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  file_name TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis table to store OpenAI analysis results
CREATE TABLE analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) NOT NULL,
  analysis_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for PDF documents
-- Execute this in the Supabase dashboard or set up via the Supabase API
-- storage.createBucket('repc_documents', { public: false }); 
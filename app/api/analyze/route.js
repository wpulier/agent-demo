"use server";

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import openai from '@/lib/openaiClient';
import { supabase } from '@/lib/supabaseClient';

// Create global cache for analysis results if it doesn't exist
if (typeof global.analysisCache === 'undefined') {
  global.analysisCache = {};
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if file is PDF
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Convert file to buffer and base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Pdf = buffer.toString('base64');
    
    // Create a unique ID for this transaction
    const transactionId = uuidv4();
    const fileName = file.name;
    
    // Upload file to Supabase Storage
    try {
      // Check if bucket exists, create if it doesn't
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets.some(bucket => bucket.name === 'repc_documents');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('repc_documents', {
          public: false
        });
      }
      
      // Upload the file
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('repc_documents')
        .upload(`${transactionId}/${fileName}`, buffer);

      if (storageError) {
        console.error('Error uploading to storage:', storageError);
        return NextResponse.json(
          { error: 'Failed to upload document' },
          { status: 500 }
        );
      }
    } catch (storageError) {
      console.error('Storage operation failed:', storageError);
      // Continue with analysis even if storage fails
    }

    // Check if transactions table exists, create if it doesn't
    try {
      const { error } = await supabase.rpc('check_table_exists', { table_name: 'transactions' });
      
      if (error) {
        // Table likely doesn't exist, create it
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS transactions (
            id UUID PRIMARY KEY,
            file_name TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE TABLE IF NOT EXISTS analysis (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            transaction_id UUID REFERENCES transactions(id) NOT NULL,
            analysis_text TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      }
    } catch (tableError) {
      console.error('Table check/creation failed:', tableError);
      // Continue with analysis even if table creation fails
    }
    
    // Use OpenAI's vision capabilities to analyze the PDF
    try {
      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-4-vision-preview", // Using vision model - make sure your API key has access
        messages: [
          {
            role: "system",
            content: "You are a real estate assistant that specializes in analyzing purchase contracts."
          },
          {
            role: "user", 
            content: [
              {
                type: "text",
                text: "Analyze this Real Estate Purchase Contract (REPC) and provide a summary of key information including: 1) Buyer and seller names, 2) Property address, 3) Purchase price, 4) Important dates (due diligence deadline, financing deadline, settlement/closing date), 5) Contingencies, 6) Any special terms or conditions. Format the response in a clear, organized way."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      });

      // Extract the analysis text
      const analysisText = analysisResponse.choices[0].message.content;
      
      // Store in in-memory cache for direct retrieval
      global.analysisCache[transactionId] = {
        analysisText,
        fileName,
        timestamp: new Date().toISOString()
      };
      
      // Clean up old cache entries (keep only last 50)
      const cacheKeys = Object.keys(global.analysisCache);
      if (cacheKeys.length > 50) {
        const oldestKeys = cacheKeys.sort((a, b) => {
          return global.analysisCache[a].timestamp.localeCompare(global.analysisCache[b].timestamp);
        }).slice(0, cacheKeys.length - 50);
        
        oldestKeys.forEach(key => {
          delete global.analysisCache[key];
        });
      }
      
      // Try to store in Supabase if tables exist
      try {
        // Store transaction
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              id: transactionId,
              file_name: fileName,
              status: 'analyzed',
              created_at: new Date().toISOString()
            }
          ])
          .select();
          
        if (!transactionError) {
          // Store analysis
          await supabase
            .from('analysis')
            .insert([
              {
                transaction_id: transactionId,
                analysis_text: analysisText
              }
            ]);
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        // Continue and return the analysis even if DB operations fail
      }
      
      // Return successful response with analysis
      return NextResponse.json({
        success: true,
        transactionId,
        analysisText,
        message: 'Document successfully analyzed'
      });
      
    } catch (aiError) {
      console.error('OpenAI analysis failed:', aiError);
      return NextResponse.json(
        { error: 'Failed to analyze document with AI' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 
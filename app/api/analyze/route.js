"use server";

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromPDF } from '@/lib/pdfUtils';
import openai from '@/lib/openaiClient';
import { supabase } from '@/lib/supabaseClient';

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

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a unique ID for this transaction
    const transactionId = uuidv4();
    const fileName = file.name;
    
    // Upload file to Supabase Storage
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

    // Extract text from PDF
    const pdfText = await extractTextFromPDF(buffer);
    
    // Analyze text with OpenAI
    const analysisPrompt = `
      Analyze this Real Estate Purchase Contract (REPC) and provide a summary of key information including:
      1. Buyer and seller names
      2. Property address
      3. Purchase price
      4. Important dates (due diligence deadline, financing deadline, settlement/closing date)
      5. Contingencies
      6. Any special terms or conditions
      
      Format the response in a clear, organized way that a real estate agent can easily understand and share with clients.
      
      REPC Text:
      ${pdfText.substring(0, 15000)} // Limiting to 15000 chars to avoid token limits
    `;

    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a real estate assistant that specializes in analyzing purchase contracts." },
        { role: "user", content: analysisPrompt }
      ],
      temperature: 0.3,
    });

    const analysisText = analysisResponse.choices[0].message.content;
    
    // Store transaction and analysis in Supabase database
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
      
    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return NextResponse.json(
        { error: 'Failed to create transaction record' },
        { status: 500 }
      );
    }
    
    const { data: analysisData, error: analysisError } = await supabase
      .from('analysis')
      .insert([
        {
          transaction_id: transactionId,
          analysis_text: analysisText
        }
      ]);
      
    if (analysisError) {
      console.error('Error storing analysis:', analysisError);
      return NextResponse.json(
        { error: 'Failed to store analysis' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      transactionId,
      message: 'Document successfully analyzed'
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
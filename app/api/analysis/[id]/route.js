"use server";

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    try {
      // Try to get from Supabase first if available
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (transactionError) {
        throw new Error('Failed to fetch transaction');
      }

      const { data: analysisData, error: analysisError } = await supabase
        .from('analysis')
        .select('*')
        .eq('transaction_id', id)
        .single();

      if (analysisError) {
        throw new Error('Failed to fetch analysis');
      }

      return NextResponse.json({
        transaction: transactionData,
        analysis: analysisData
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Check if this is a session ID from direct analysis
      const cachedData = global.analysisCache?.[id];
      if (cachedData) {
        return NextResponse.json({
          analysisText: cachedData.analysisText,
          transaction: {
            id: id,
            file_name: cachedData.fileName || "Document Analysis",
            status: "analyzed",
            created_at: cachedData.timestamp || new Date().toISOString()
          }
        });
      }
      
      // If no cached data, return error
      return NextResponse.json(
        { error: 'Analysis not found or database not available' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
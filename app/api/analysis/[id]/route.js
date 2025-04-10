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

    // Get transaction info
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (transactionError) {
      console.error('Error fetching transaction:', transactionError);
      return NextResponse.json(
        { error: 'Failed to fetch transaction' },
        { status: 500 }
      );
    }

    if (!transactionData) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Get analysis for this transaction
    const { data: analysisData, error: analysisError } = await supabase
      .from('analysis')
      .select('*')
      .eq('transaction_id', id)
      .single();

    if (analysisError) {
      console.error('Error fetching analysis:', analysisError);
      return NextResponse.json(
        { error: 'Failed to fetch analysis' },
        { status: 500 }
      );
    }

    if (!analysisData) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      transaction: transactionData,
      analysis: analysisData
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
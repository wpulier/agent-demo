"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface AnalysisData {
  id?: string;
  transaction_id?: string;
  analysis_text: string;
  created_at?: string;
}

interface TransactionData {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
}

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    // Fetch analysis data
    const fetchAnalysis = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/analysis/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch analysis');
        }
        
        // If we get analyzedText directly (from newer API implementation)
        if (data.analysisText) {
          setAnalysis({ analysis_text: data.analysisText });
          if (data.transaction) {
            setTransaction(data.transaction);
          } else {
            // Create simple transaction info from ID
            setTransaction({
              id: id,
              file_name: "Document Analysis",
              status: "analyzed",
              created_at: new Date().toISOString()
            });
          }
        } else {
          // Original DB-based approach
          setAnalysis(data.analysis);
          setTransaction(data.transaction);
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const formatAnalysisText = (text: string) => {
    // Replace new lines with HTML line breaks
    return text.split('\n').map((line, i) => (
      <p key={i} className={line.match(/^[0-9]\./) ? 'font-semibold mt-2' : 'mt-1'}>
        {line}
      </p>
    ));
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">LoanX.ai</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href="#" className="text-sm font-medium hover:underline">Transactions</Link>
            <Link href="#" className="text-sm font-medium hover:underline">Settings</Link>
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {isLoading ? 'Loading Analysis...' : transaction ? `Analysis for ${transaction.file_name}` : 'Analysis'}
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading analysis...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-600">Error</h3>
                <p className="mt-2">{error}</p>
                <Button className="mt-4" onClick={() => router.push('/')}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>REPC Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-md">
                {analysis ? (
                  <div className="prose max-w-none">
                    {formatAnalysisText(analysis.analysis_text)}
                  </div>
                ) : (
                  <p>No analysis data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
} 
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define transaction type
interface Transaction {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    // Fetch recent transactions
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        const data = await response.json();
        
        if (data.transactions) {
          setTransactions(data.transactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check if file is a PDF
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are accepted');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Check if file is a PDF
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are accepted');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze REPC');
      }

      // Redirect to the analysis page
      router.push(`/analysis/${result.transactionId}`);
    } catch (error) {
      console.error('Error analyzing REPC:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    document.getElementById('repc-upload')?.click();
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        </div>

        {/* REPC Upload Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>REPC Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Drag & drop your REPC</h3>
                <p className="text-sm text-gray-500">
                  {selectedFile 
                    ? `Selected: ${selectedFile.name}` 
                    : "Drag and drop your REPC file here, or click to select"}
                </p>
                <input
                  id="repc-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
                <Button 
                  className="mt-2" 
                  onClick={openFileDialog}
                  disabled={isUploading}
                >
                  Select File
                </Button>
                {error && (
                  <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
              </div>
            </div>
            <Button 
              className="w-full mt-4" 
              size="lg"
              onClick={handleAnalyze}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? "Processing..." : "Analyze REPC"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No transactions yet. Upload a REPC to get started.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{transaction.file_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                        {transaction.status}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/analysis/${transaction.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

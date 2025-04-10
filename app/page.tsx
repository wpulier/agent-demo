"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
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
                  Drag and drop your REPC file here, or click to select
                </p>
                <input
                  id="repc-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                />
                <Button className="mt-2" onClick={() => document.getElementById('repc-upload')?.click()}>
                  Select File
                </Button>
              </div>
            </div>
            <Button className="w-full mt-4" size="lg">
              Analyze REPC
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">123 Main St - Smith, John</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                      Active
                    </span>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  // Placeholder transaction folders
  const transactionFolders = [
    { id: 1, name: "123 Main St - Smith, John", date: "2024-07-25", status: "Active" },
    { id: 2, name: "456 Oak Ave - Johnson, Mary", date: "2024-07-24", status: "Pending" },
    { id: 3, name: "789 Pine Blvd - Williams, Robert", date: "2024-07-23", status: "Closed" },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/offer/new">Create New Offer</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transactionFolders.map((folder) => (
          <Card key={folder.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>{folder.name}</CardTitle>
              <CardDescription>Created: {folder.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-sm ${
                  folder.status === "Active" ? "bg-green-100 text-green-800" :
                  folder.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {folder.status}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/transaction/${folder.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function NewOfferPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" className="mr-4" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <h1 className="text-3xl font-bold">Create New Offer</h1>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>New REPC Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="natural-input" className="text-sm font-medium">
                Describe your offer in natural language
              </label>
              <Textarea
                id="natural-input"
                placeholder="Write an offer for Eric Simonson, $750K on 123 Main St with 30-day close..."
                className="h-32"
              />
              <p className="text-sm text-gray-500">
                Enter details like buyer name, property address, offer amount, and any special terms.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="client-name" className="text-sm font-medium">
                Client Full Name
              </label>
              <Input id="client-name" placeholder="Client Full Name" />
            </div>

            <div className="space-y-2">
              <label htmlFor="property-address" className="text-sm font-medium">
                Property Address
              </label>
              <Input id="property-address" placeholder="Full Property Address" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="offer-amount" className="text-sm font-medium">
                  Offer Amount
                </label>
                <Input id="offer-amount" placeholder="$0.00" />
              </div>
              <div className="space-y-2">
                <label htmlFor="closing-date" className="text-sm font-medium">
                  Desired Closing Date
                </label>
                <Input id="closing-date" type="date" />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline">Save Draft</Button>
              <Button>Create Offer</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
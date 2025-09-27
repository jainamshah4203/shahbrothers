"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Customer Detail</h1>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Profile & Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Show profile, orders, and reviews for customer #{params.id}.</div>
        </CardContent>
      </Card>
    </div>
  );
}

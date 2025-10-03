"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { use as useUnwrap } from "react";

export default function CustomerDetailPage({ params }: { params: any }) {
  // In Next.js 15+, params can be a Promise. Unwrap with React.use()
  const unwrappedParams = (params && typeof params.then === "function") ? useUnwrap(params) : params;
  const id: string = unwrappedParams?.id;

  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Customer Detail</h1>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Profile & Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Show profile, orders, and reviews for customer #{id}.</div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MediaPage() {
  return (
    <div className="p-3 md:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Media Library</h1>
        <Link href="/media/upload"><Button size="sm">Upload Media</Button></Link>
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Media Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Connect API to show media grid here.</div>
        </CardContent>
      </Card>
    </div>
  );
}

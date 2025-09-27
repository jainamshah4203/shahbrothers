"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewCategoryPage() {
  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Add Category</h1>
      <Card className="border-0 shadow-sm max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="e.g. Shoes" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Short description" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Image (optional)</Label>
              <Input id="image" type="file" />
            </div>
            <Button type="button">Save Category</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UploadMediaPage() {
  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Upload Media</h1>
      <Card className="border-0 shadow-sm max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="files">Select Files</Label>
              <Input id="files" type="file" multiple />
            </div>
            <Button type="button">Upload</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/services/categories";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toSlug = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = name.trim();
    const s = (slug || toSlug(name)).trim();
    if (!n || !s) {
      setError("Name is required. Slug will be generated automatically if left blank.");
      return;
    }
    try {
      setSaving(true);
      await createCategory({ name: n, slug: s, description: description.trim() || undefined });
      router.replace("/(admin)/categories");
    } catch (e: any) {
      setError(e?.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Add Category</h1>
      <Card className="border-0 shadow-sm max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="e.g. Shoes" value={name} onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(toSlug(e.target.value));
              }} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="e.g. shoes" value={slug} onChange={(e) => setSlug(toSlug(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Category"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

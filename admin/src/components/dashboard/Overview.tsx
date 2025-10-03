"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface OverviewPoint { month: string; count: number; total: number }

export function Overview({ data }: { data: OverviewPoint[] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full h-44 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500">
        No data
      </div>
    );
  }
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip cursor={{ fill: "#f5f5f5" }} />
          <Bar dataKey="count" fill="#7c3aed" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

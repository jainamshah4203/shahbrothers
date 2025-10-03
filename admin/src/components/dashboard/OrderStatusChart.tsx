"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface StatusPoint { status: string; count: number }

const COLORS: Record<string, string> = {
  Pending: "#fde047", // yellow-300
  Processing: "#60a5fa", // blue-400
  Shipped: "#34d399", // emerald-400
  Delivered: "#22c55e", // green-500
  Cancelled: "#ef4444", // red-500
  Unverified: "#a3a3a3", // neutral-400
  Unknown: "#c084fc", // purple-400
};

export function OrderStatusChart({ data }: { data: StatusPoint[] }) {
  const hasData = Array.isArray(data) && data.some((d) => d.count > 0);
  if (!hasData) {
    return (
      <div className="w-full h-44 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500">
        No data
      </div>
    );
  }
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" innerRadius={50} outerRadius={70} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.status] || COLORS.Unknown} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

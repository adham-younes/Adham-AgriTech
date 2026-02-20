'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function NdviChart({ data }: { data: Array<{ date: string; value: number }> }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, left: 0, right: 8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="4 4" />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => value.slice(5)}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(3, 10, 5, 0.95)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 12,
              color: '#f8fafc'
            }}
            labelStyle={{ color: '#cbd5e1' }}
            formatter={(value: number) => [value.toFixed(2), 'NDVI']}
          />
          <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#34d399', r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

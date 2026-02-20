'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function NdviChart({ data }: { data: Array<{ date: string; value: number }> }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, left: 0, right: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--agri-chart-grid)" strokeDasharray="4 4" />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => value.slice(5)}
            tick={{ fill: 'var(--agri-text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--agri-chart-axis)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fill: 'var(--agri-text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--agri-chart-axis)' }}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(3, 10, 5, 0.95)',
              border: '1px solid var(--agri-border-default)',
              borderRadius: 12,
              color: 'var(--agri-text-primary)'
            }}
            labelStyle={{ color: 'var(--agri-text-secondary)' }}
            formatter={(value: number) => [value.toFixed(2), 'NDVI']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--agri-chart-line)"
            strokeWidth={3}
            dot={{ fill: 'var(--agri-chart-dot)', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell
} from 'recharts';

interface ZScoreChartProps {
    zWeightForAge: number | string | null;
    zHeightForAge: number | string | null;
    zWeightForHeight: number | string | null;
}

export default function ZScoreChart({
    zWeightForAge,
    zHeightForAge,
    zWeightForHeight
}: ZScoreChartProps) {

    // Konversi string ke number jika diperlukan (karena .toFixed(2) menghasilkan string)
    const parseZ = (val: number | string | null): number | null => {
        if (val === null) return null;
        const parsed = typeof val === 'string' ? parseFloat(val) : val;
        return isNaN(parsed) ? null : parsed;
    };

    const data = [
        { name: 'BB/U', z: parseZ(zWeightForAge), type: 'Berat Badan' },
        { name: 'TB/U', z: parseZ(zHeightForAge), type: 'Tinggi Badan' },
        { name: 'BB/TB', z: parseZ(zWeightForHeight), type: 'Proporsional' },
    ].filter((d): d is { name: string; z: number; type: string } => d.z !== null);

    // Fungsi sekarang menerima number | null agar aman dari error TS2345
    const getPointColor = (z: number | null) => {
        if (z === null) return '#9ca3af';
        if (z < -3 || z > 3) return '#ef4444'; // Merah (Bahaya)
        if (z < -2 || z > 2) return '#f97316'; // Orange (Waspada)
        return '#22c55e'; // Hijau (Normal)
    };

    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                    margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

                    <XAxis
                        type="number"
                        dataKey="z"
                        name="Z-Score"
                        domain={[-5, 5]}
                        ticks={[-3, -2, -1, 0, 1, 2, 3]}
                        fontSize={12}
                        tick={{ fill: '#9ca3af' }}
                    />

                    <YAxis
                        type="category"
                        dataKey="name"
                        name="Indikator"
                        width={70}
                        fontSize={12}
                        tick={{ fill: '#4b5563', fontWeight: 'bold' }}
                    />

                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                                        <p className="text-xs font-bold text-gray-800">{d.name} ({d.type})</p>
                                        <p className="text-sm font-black" style={{ color: getPointColor(d.z) }}>
                                            Z-Score: {d.z}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />

                    <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={2} label={{ value: 'Median', position: 'top', fontSize: 10, fill: '#9ca3af' }} />
                    <ReferenceLine x={-2} stroke="#f97316" strokeDasharray="5 5" label={{ value: '-2 SD', position: 'bottom', fontSize: 10, fill: '#f97316' }} />
                    <ReferenceLine x={2} stroke="#f97316" strokeDasharray="5 5" label={{ value: '+2 SD', position: 'bottom', fontSize: 10, fill: '#f97316' }} />
                    <ReferenceLine x={-3} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '-3 SD', position: 'bottom', fontSize: 10, fill: '#ef4444' }} />
                    <ReferenceLine x={3} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '+3 SD', position: 'bottom', fontSize: 10, fill: '#ef4444' }} />

                    <Scatter name="Status Gizi" data={data}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getPointColor(entry.z)} />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] text-gray-500">Normal</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-[10px] text-gray-500">Waspada</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-[10px] text-gray-500">Bahaya</span>
                </div>
            </div>
        </div>
    );
}
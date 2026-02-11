'use client'

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface GrowthChartProps {
    data?: any[]
    type?: 'line' | 'area' | 'bar'
    height?: number
}

export default function GrowthChart({
    data = defaultData,
    type = 'area',
    height = 300
}: GrowthChartProps) {
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                {type === 'line' && (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                padding: '12px'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="weight"
                            name="Berat Badan (kg)"
                            stroke="#FF6B8B"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "#FF6B8B" }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="height"
                            name="Tinggi Badan (cm)"
                            stroke="#7EC8E3"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "#7EC8E3" }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                )}

                {type === 'area' && (
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="weight"
                            name="Berat Badan (kg)"
                            stroke="#FF6B8B"
                            fill="#FF6B8B"
                            fillOpacity={0.2}
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="height"
                            name="Tinggi Badan (cm)"
                            stroke="#7EC8E3"
                            fill="#7EC8E3"
                            fillOpacity={0.2}
                            strokeWidth={2}
                        />
                    </AreaChart>
                )}

                {type === 'bar' && (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="weight" name="Berat Badan (kg)" fill="#FF6B8B" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="height" name="Tinggi Badan (cm)" fill="#7EC8E3" radius={[4, 4, 0, 0]} />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    )
}

const defaultData = [
    { month: 'Jan', weight: 10, height: 75 },
    { month: 'Feb', weight: 10.5, height: 76 },
    { month: 'Mar', weight: 11, height: 77 },
    { month: 'Apr', weight: 11.2, height: 78 },
    { month: 'Mei', weight: 11.5, height: 79 },
    { month: 'Jun', weight: 11.8, height: 80 },
]
'use client'
import { useEffect, useState } from 'react';
import {
    BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend, XAxis, YAxis, ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function InsightsPage() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/api/insights')
            .then(res => res.json())
            .then(setData);
    }, []);

    console.log("Insights Data:", data);

    if (!data) return <div className="p-4 text-white">Loading dashboard...</div>;

    console.log("Insights Data:", data.tasksPerUser);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-4">📊 Dashboard Insights</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Tasks Per User */}
                {/* Tasks Per User - Horizontal Bar Chart */}
                {/* Tasks Per User - Pie Chart */}
                <div className="bg-white text-gray-900 p-4 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-2">Tasks Per User (Pie)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.tasksPerUser.map(user => ({
                                    username: user.name,
                                    taskCount: user.taskCount
                                }))}
                                dataKey="taskCount"
                                nameKey="username"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {data.tasksPerUser.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>


                {/* Task Status Breakdown */}
                <div className="bg-white text-gray-900 p-4 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-2">Task Status Breakdown</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Total', value: data.totalTasks },
                                    { name: 'Completed', value: data.completedTasks },
                                    { name: 'Overdue', value: data.overdueTasks }
                                ]}
                                cx="50%" cy="50%" outerRadius={100} label
                                dataKey="value"
                            >
                                {COLORS.map((color, index) => (
                                    <Cell key={index} fill={color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

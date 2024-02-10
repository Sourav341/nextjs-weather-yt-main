import React from 'react';
import { Line } from 'react-chartjs-2';

const Chart = ({ hourlyData }) => {
    // Prepare data for the chart
    const chartData = {
        labels: hourlyData.map(hour => new Date(hour.dt * 1000).toLocaleTimeString()),
        datasets: [
            {
                label: 'Temperature (°C)',
                data: hourlyData.map(hour => Math.round(hour.temp - 273.15)), // Convert from Kelvin to Celsius
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 0.2)',
            },
        ],
    };

    return (
        <div className="mt-4 bg-gray-800 p-4 rounded-md">
            <h2 className="text-xl font-bold mb-2 text-white">Past Weather Data</h2>
            <div className="overflow-x-auto">
                <Line data={chartData} />
            </div>
        </div>
    );
};

export default Chart;

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Text
} from 'recharts';

const AdminSellsOverview = () => {
  // Mock data to simulate API response
  const mockData = [
    { month: "January", sales: 0 },
    { month: "February", sales: 0 },
    { month: "March", sales: 0 },
    { month: "April", sales: 0 },
    { month: "May", sales: 0 },
    { month: "June", sales: 0 },
    { month: "July", sales: 0 },
    { month: "August", sales: 17623 },
    { month: "September", sales: 17981 },
    { month: "October", sales: 0 },
    { month: "November", sales: 0 },
    { month: "December", sales: 0 }
  ];

  // State for selected filter and loading status
  const [filter, setFilter] = useState('This year');
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to simulate API call with different date ranges
  const fetchDataByDateRange = (range) => {
    setIsLoading(true);
    
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        let filteredData = [];
        
        switch(range) {
          case 'Last 7 days':
            // For demo purposes, let's simulate some data for last 7 days
            filteredData = [
              { day: 'Mon', sales: 1200 },
              { day: 'Tue', sales: 1800 },
              { day: 'Wed', sales: 1500 },
              { day: 'Thu', sales: 2100 },
              { day: 'Fri', sales: 2400 },
              { day: 'Sat', sales: 3200 },
              { day: 'Sun', sales: 2800 },
            ];
            break;
          case 'Last 30 days':
            // Simulate 30 days of data
            filteredData = Array.from({ length: 30 }, (_, i) => ({
              day: `Day ${i + 1}`,
              sales: Math.floor(Math.random() * 5000) + 1000
            }));
            break;
          case 'This year':
          default:
            filteredData = mockData;
        }
        
        setIsLoading(false);
        resolve(filteredData);
      }, 800); // Simulate network delay
    });
  };
  
  // State for chart data
  const [chartData, setChartData] = useState(mockData);
  
  // Handle filter change
  const handleFilterChange = async (e) => {
    const selectedFilter = e.target.value;
    setFilter(selectedFilter);
    
    const data = await fetchDataByDateRange(selectedFilter);
    setChartData(data);
  };
  
  // Check if all sales are zero
  const allZero = chartData?.every(item => item.sales === 0);

  // Determine the data key based on the selected filter
  const dataKey = filter === 'This year' ? 'month' : 'day';

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Sales Overview</h2>
        <select 
          className="border px-3 py-1 rounded-md text-sm text-gray-700"
          value={filter}
          onChange={handleFilterChange}
          disabled={isLoading}
        >
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>This year</option>
        </select>
      </div>

      {isLoading ? (
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      ) : allZero ? (
        <div className="h-[350px] flex flex-col items-center justify-center">
          <p className="text-gray-500 mb-2">No sales data available</p>
          <p className="text-sm text-gray-400">
            Your sales chart will appear here when you make sales
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CBA135" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#CBA135" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey={dataKey}
              stroke="#888888"
              tick={filter === 'This year' ? <CustomizedAxisTick /> : undefined}
            />
            <YAxis
              tickFormatter={(val) => `$${val / 1000}k`}
              stroke="#888888"
              domain={['auto', 'auto']}
            />
            <Tooltip
              formatter={(val) => [`$${val.toLocaleString()}`, 'Sales']}
              labelFormatter={(label) => `${filter === 'This year' ? 'Month' : 'Day'}: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#CBA135"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// Custom XAxis tick component for months
const CustomizedAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <Text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="#666"
        fontSize={12}
      >
        {payload.value.substring(0, 3)}
      </Text>
    </g>
  );
};

export default AdminSellsOverview;
// BarCharts.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTopCategoryQuery } from '../../../../../redux/slices/apiSlice';

// Fallback data in case API fails
const fallbackData = [
  { name: 'Sofa', value: 50 },
  { name: 'Chair', value: 65 },
  { name: 'Table', value: 85 },
  { name: 'Bed', value: 90 },
  { name: 'Desk', value: 83 },
  { name: 'Cabinet', value: 102 },
];

const BarCharts = () => {
  const { data: topCategories, error, isLoading } = useTopCategoryQuery();
  


  // Transform API data for the chart
  const chartData = React.useMemo(() => {
    if (topCategories?.top_categories && topCategories.top_categories.length > 0) {
      return topCategories.top_categories.map((category) => ({
        name: category.category,
        value: category.percentage,
        quantity_sold: category.quantity_sold,
        category_id: category.category_id
      }));
    }
    return fallbackData;
  }, [topCategories]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-white w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89A2A] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    console.error('Error fetching top categories:', error);
    return (
      <div className="bg-white w-full h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Failed to load chart data</p>
          <p className="text-sm text-gray-600 mt-1">Using sample data</p>
        </div>
      </div>
    );
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-sm">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-semibold text-[#C89A2A]">{data.value}%</span>
          </p>
          {data.quantity_sold && (
            <p className="text-sm text-gray-600">
              Quantity Sold: <span className="font-semibold">{data.quantity_sold}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barSize={40}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            fontSize={12}
          />
          <YAxis
            tickFormatter={(tick) => `${tick}%`}
            domain={[0, 'dataMax + 10']} // Dynamic domain based on data
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            fill="#C89A2A"
            radius={[10, 10, 0, 0]} // Rounded top
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Data source indicator */}

    </div>
  );
};

export default BarCharts;
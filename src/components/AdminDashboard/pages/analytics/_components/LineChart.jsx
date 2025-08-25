import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGetFurnitureSellsQuery } from '../../../../../redux/slices/Apis/dashboardApis';

const LineCharts = () => {
  const { data, isLoading, error } = useGetFurnitureSellsQuery();
  console.log(data, 'furniture overview');

  // ✅ transform API response
  const chartData =
    data?.map((item) => ({
      name: item.month, // X axis
      sales: item.sales, // Y axis
    })) || [];

  return (
    <div className="w-full h-[350px] bg-white rounded-xl shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Sales Performance
      </h2>

      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <p>Loading sales data...</p>
        </div>
      ) : error ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-red-500">Error loading sales data</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
            <Tooltip
              formatter={(val) => [`$${val.toLocaleString()}`, 'Sales']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#CBA135"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LineCharts;

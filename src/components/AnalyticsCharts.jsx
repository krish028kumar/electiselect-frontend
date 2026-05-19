import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Label
} from 'recharts';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0d9488', '#e11d48'];

export const AnalyticsCharts = ({ analytics, isIseStaff }) => {
  if (!analytics) return null;

  // 1. Subject Popularity (Bar Chart)
  // Combine open and dept electives if authorized
  const openElectives = analytics.openElectivePopular || [];
  const deptElectives = (isIseStaff ? analytics.deptElectivePopular : []) || [];
  
  const popularityData = [
    ...openElectives.map(s => ({ ...s, type: 'Open Elective' })),
    ...deptElectives.map(s => ({ ...s, type: 'Dept Elective' }))
  ].sort((a, b) => b.filledSeats - a.filledSeats).slice(0, 15); // Top 15

  // 2. Seat Utilization (Donut Chart)
  const totalMaxSeats = popularityData.reduce((acc, curr) => acc + (curr.maxSeats || 0), 0);
  const totalFilledSeats = popularityData.reduce((acc, curr) => acc + (curr.filledSeats || 0), 0);
  const remainingSeats = Math.max(0, totalMaxSeats - totalFilledSeats);
  
  const utilizationData = totalMaxSeats > 0 ? [
    { name: 'Filled Seats', value: totalFilledSeats },
    { name: 'Remaining Seats', value: remainingSeats }
  ] : [];

  const seatUtilizationRaw = totalMaxSeats > 0 ? (totalFilledSeats / totalMaxSeats) * 100 : 0;
  let seatUtilizationFormatted = '0%';
  if (seatUtilizationRaw > 0 && seatUtilizationRaw < 10) {
    seatUtilizationFormatted = `${seatUtilizationRaw.toFixed(1)}%`;
  } else if (seatUtilizationRaw >= 10) {
    seatUtilizationFormatted = `${Math.round(seatUtilizationRaw)}%`;
  }

  // 3. Department Participation (Horizontal Bar Chart)
  const deptParticipationData = (analytics.departmentCounts || [])
    .filter(d => d.department && d.count > 0)
    .sort((a, b) => b.count - a.count);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl text-sm">
          <p className="font-bold text-gray-900 mb-2">{data.title || label}</p>
          {data.filledSeats !== undefined && data.maxSeats !== undefined ? (
            <>
              <p className="font-medium text-blue-600">Filled Seats: {data.filledSeats}</p>
              <p className="font-medium text-gray-600">Max Seats: {data.maxSeats}</p>
              <p className="font-medium text-emerald-600">Remaining Seats: {Math.max(0, data.maxSeats - data.filledSeats)}</p>
            </>
          ) : (
            payload.map((entry, index) => (
              <p key={index} style={{ color: entry.color }} className="font-medium">
                {entry.name}: {entry.value}
              </p>
            ))
          )}
        </div>
      );
    }
    return null;
  };

  const EmptyState = () => (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
      <p className="text-gray-400 font-medium text-sm">No data available for selected filters</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Chart 1: Subject Popularity */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Subject Popularity</h3>
          <p className="text-sm text-gray-500">Most selected electives</p>
        </div>
        
        {popularityData.length === 0 ? <EmptyState /> : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularityData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="courseCode" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }}
                />
                <YAxis 
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="filledSeats" name="Filled Seats" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart 2: Seat Utilization */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Seat Utilization</h3>
            <p className="text-sm text-gray-500">Overall allocation efficiency</p>
          </div>
          
          {utilizationData.length === 0 ? <EmptyState /> : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={utilizationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#e2e8f0" />
                    <Label
                      value={seatUtilizationFormatted}
                      position="center"
                      className="text-2xl font-black fill-gray-900"
                    />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 3: Department Participation */}
        {isIseStaff && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Department Participation</h3>
              <p className="text-sm text-gray-500">Registrations grouped by department</p>
            </div>
            
            {deptParticipationData.length === 0 ? <EmptyState /> : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    layout="vertical" 
                    data={deptParticipationData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} />
                    <YAxis 
                      type="category" 
                      dataKey="department" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Students" radius={[0, 4, 4, 0]} maxBarSize={30}>
                      {deptParticipationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

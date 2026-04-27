const Table = ({ columns, data, emptyMessage = "No data available" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="text-gray-300 mb-4 text-5xl">📄</div>
        <p className="text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-sm text-gray-900">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

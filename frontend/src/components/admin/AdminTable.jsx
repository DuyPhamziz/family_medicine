import React from 'react';

/**
 * AdminTable component
 * Reusable table component for admin list views
 */
const AdminTable = ({
  columns = [],
  rows = [],
  onRowClick,
  compact = false,
}) => {
  if (rows.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 ${
                  col.width ? `w-${col.width}` : ''
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-slate-200 dark:border-slate-800 transition-colors ${
                onRowClick
                  ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer'
                  : ''
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-6 ${compact ? 'py-2' : 'py-3'} text-sm text-slate-700 dark:text-slate-300`}
                >
                  {typeof col.render === 'function'
                    ? col.render(row[col.key], row)
                    : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;

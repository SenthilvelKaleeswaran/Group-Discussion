import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatTopicName } from "../../utils";

export const Table = ({ data, sortKey, selectable = false, onSelectionChange }) => {
  const [sortedData, setSortedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});

  // Sorting the table data
  useEffect(() => {
    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortKey]?.value ?? a[sortKey];
      const bValue = b[sortKey]?.value ?? b[sortKey];
      if (typeof aValue === "number") {
        return bValue - aValue;
      } else {
        return aValue?.localeCompare(bValue);
      }
    });

    setSortedData(sorted);
  }, [data, sortKey]);

  // Get visible columns by filtering out those with display: false
  const visibleColumns = data.length > 0
    ? Object.keys(data[0]).filter((key) => data[0][key]?.display !== false)
    : [];

  // Handle row selection
  const handleRowSelect = (rowId) => {
    const newSelectedRows = {
      ...selectedRows,
      [rowId]: !selectedRows[rowId],
    };

    setSelectedRows(newSelectedRows);

    // Notify parent component about selection change
    if (onSelectionChange) {
      const selectedIds = Object.keys(newSelectedRows).filter((id) => newSelectedRows[id]);
      onSelectionChange(selectedIds);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-transparent border border-gray-700 rounded-lg shadow-sm">
        <thead className="bg-gray-800">
          <tr>
            {selectable && (
              <th className="py-2 px-4 border-b border-gray-700 text-left text-sm font-semibold text-gray-600">
              </th>
            )}
            {visibleColumns.map((key) => (
              <th
                key={key}
                className="py-2 px-4 border-b border-gray-700 text-left text-sm font-semibold text-gray-600"
              >
                {formatTopicName(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const rowId = row?._id?.value ?? row?._id;
            return (
              <motion.tr
                key={rowId}
                layout
                transition={{ type: "spring", stiffness: 70 }}
                className={`transition-all ${
                  index % 2 === 0 ? "bg-gray-900" : "bg-gray-900"
                } hover:bg-gray-800`}
              >
                {selectable && (
                  <td className="py-2 px-4 border-b text-left border-gray-800 text-sm text-gray-500">
                    <input
                      type="checkbox"
                      checked={!!selectedRows[rowId]}
                      onChange={() => handleRowSelect(rowId)}
                    />
                  </td>
                )}
                {visibleColumns.map((key) => (
                  <td
                    key={key}
                    className="py-2 px-4 border-b text-left border-gray-800 text-sm text-gray-700"
                  >
                    {row[key]?.value ?? row[key]}
                  </td>
                ))}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

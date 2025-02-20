import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Table = ({ data, sortKey }) => {
  const [sortedData, setSortedData] = useState([]);

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
  const visibleColumns =
    data.length > 0
      ? Object.keys(data[0]).filter((key) => data[0][key]?.display !== false)
      : [];

 console.log({visibleColumns})

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-transparent border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-800">
          <tr>
            {visibleColumns.map((key) => (
              <th
                key={key}
                className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-600"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <motion.tr
              key={row?._id?.value ?? row?._id }
              layout
              transition={{ type: "spring", stiffness: 70 }}
              className={`transition-all ${
                index % 2 === 0 ? "bg-gray-900" : "bg-gray-900"
              } hover:bg-gray-100`}
            >
              {visibleColumns.map((key) => (
                <td
                  key={key}
                  className="py-2 px-4 border-b border-gray-800 text-sm text-gray-700"
                >
                  {row[key]?.value ?? row[key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

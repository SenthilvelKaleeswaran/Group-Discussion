import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatTopicName } from "../../utils";

export const Table = ({
  data,
  sortKey,
  selectable = false,
  onSelectionChange,
  selectedRows = [], // Ensure it defaults to an array
  highlightedRows = [],
}) => {
  const [sortedData, setSortedData] = useState([]);
  const [selected, setSelected] = useState(() => getSelectedRows(selectedRows));

  // Function to map selectedRows to object format
  function getSelectedRows(rows) {
    return rows.reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {});
  }

  // Sync state when selectedRows prop changes
  useEffect(() => {
    const updatedSelection = getSelectedRows(selectedRows);

    // Only update state if there is an actual change to prevent infinite loop
    setSelected((prevSelected) => {
      const prevKeys = Object.keys(prevSelected);
      const newKeys = Object.keys(updatedSelection);

      // Compare current state with the new selection
      if (prevKeys.length === newKeys.length && prevKeys.every((key) => updatedSelection[key])) {
        return prevSelected; // No change, avoid re-render
      }

      return updatedSelection;
    });
  }, [selectedRows]);

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

  const visibleColumns =
    data.length > 0
      ? Object.keys(data[0]).filter((key) => data[0][key]?.display !== false)
      : [];

  const handleRowSelect = (rowId) => {
    setSelected((prevSelected) => {
      const newSelectedRows = {
        ...prevSelected,
        [rowId]: !prevSelected[rowId],
      };

      // Notify parent component about selection change
      if (onSelectionChange) {
        const selectedIds = Object.keys(newSelectedRows).filter((id) => newSelectedRows[id]);
        onSelectionChange(selectedIds);
      }

      return newSelectedRows;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-transparent border border-gray-700 rounded-lg shadow-sm">
        <thead className="bg-gray-800">
          <tr>
            {selectable && <th className="py-2 px-4 border-b border-gray-700"></th>}
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
            const isHighlighted = highlightedRows.includes(rowId);

            return (
              <motion.tr
                key={rowId}
                layout
                transition={{ type: "spring", stiffness: 70 }}
                className={`transition-all ${
                  isHighlighted ? "bg-slate-500" : index % 2 === 0 ? "bg-gray-900" : "bg-gray-900"
                } hover:bg-gray-800`}
              >
                {selectable && (
                  <td className="py-2 px-4 border-b text-left border-gray-800 text-sm text-gray-500">
                    <input
                      type="checkbox"
                      checked={!!selected[rowId]}
                      onChange={() => handleRowSelect(rowId)}
                    />
                  </td>
                )}
                {visibleColumns.map((key) => (
                  <td key={key} className="py-2 px-4 border-b text-left border-gray-800 text-sm text-gray-700">
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

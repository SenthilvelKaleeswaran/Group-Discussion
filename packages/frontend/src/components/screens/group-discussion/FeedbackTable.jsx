import React, { useState, useEffect, useCallback } from "react";
import { Table } from "../../ui";
import { useSelector } from "react-redux";
import { Loader } from "../../shared";

export function FeedbackTable({ events, aiParticipants }) {
  const { participants, loading } = useSelector((state) => state.participants);

  // State to hold table data
  const [data, setData] = useState([]);

  // Function to prepare table data
  const getTableData = useCallback(() => {
    if (loading) return [];
    const users = [
      ...(participants?.participant || []),
      ...(aiParticipants || []),
    ];
    console.log({ users, loading });

    return users.map((item) => ({
      _id: {
        display: false,
        value: item?._id,
      },
      userId: {
        display: false,
        value: item?.userId || item?._id,
      },
      name: {
        value: item?.name,
      },
      totalPoints: {
        value: 0,
      },
      score: {
        value: 45,
      },
      conclusionPoints: {
        value: 0,
      },
    }));
  }, [participants?.participant, aiParticipants, loading]);

  // Update table data whenever participants or aiParticipants change
  useEffect(() => {
    const newData = getTableData();
    setData(newData);
  }, [getTableData]);

  // Random score updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        return prevData.map((item) => ({
          ...item,
          score: {
            ...item.score,
            value: Math.floor(Math.random() * 100), // Random score updates
          },
        }));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;

  return <Table data={data} sortKey="score" />;
}

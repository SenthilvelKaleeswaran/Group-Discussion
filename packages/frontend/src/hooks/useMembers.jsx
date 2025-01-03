import { useEffect, useMemo, useState } from "react";

export const useMembers = (data) => {

  const [currentMember, setCurrentMember] = useState(null);
  const userId = localStorage.getItem("userId");

  const members = useMemo(() => {
    if (!data) {
      console.warn("No data provided to useMembers hook");
      return [];
    }

    const aiMembers = (data?.aiParticipants || []).map((item) => ({
      ...item,
      type: "AI",
    }));

    const userMembers = (data?.participants || []).reduce((acc, item) => {
      if (userId !== item?._id) {
        acc.push({ ...item, type: "User" });
      } else {
        acc.push({ ...item, type: "You" });
      }
      return acc;
    }, []);

    return [...aiMembers, ...userMembers];
  }, [data, userId]);

  const selectRandomMember = (member) => {
   
  };

  const selectMember = (randomMember) => {

    const id  = randomMember || userId
    const selectedMember = members?.find(
      (member) => member?._id === id
    );

    if (selectedMember) {
      setCurrentMember(selectedMember);
    } else {
      console.warn("No member found with the provided ID");
    }
  };

  const resetCurrentMember = () => setCurrentMember(null)

 

  return {
    members,
    currentMember,
    selectMember,
    selectRandomMember,
    resetCurrentMember
  };
};

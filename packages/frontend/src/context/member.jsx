import React, { createContext, useState, useContext, useEffect } from "react";

// Create Context
const MemberContext = createContext();

// Provider Component
export const MemberProvider = ({ children }) => {
  // State to manage members and currentMember
  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);

  useEffect(() => {
    // Generate members on component mount
    generateMembers();
  }, []);

  const selectRandomMember = (membersList = members) => {
    console.log("Selecting a random member from:", membersList);
    // Filter out the current member
    const eligibleMembers = membersList.filter(
      (member) => member !== currentMember && member?.id !== "User"
    );
    console.log("Eligible members:", eligibleMembers);

    if (eligibleMembers.length > 0) {
      const shuffled = [...eligibleMembers].sort(() => Math.random() - 0.5); // Shuffle eligible members
      const selectedMember = shuffled[0];
      console.log("Selected member:", selectedMember);
      setCurrentMember(selectedMember); // Set a new random member
    } else {
      console.warn("No eligible members found for selection");
    }
  };

  const generateMembers = (n = 3) => {
    console.log("Generating members...");
    const newMembers = Array.from({ length: n }, (_, index) => ({
      id: index + 1,
      name: `Member ${index + 1}`,
    }));
    newMembers.push({
      id: "User",
      name: "Senthilvel",
    });
    console.log("Generated members:", newMembers);
    setMembers(newMembers);
    selectRandomMember(newMembers); // Select a random member after generating
  };

  const selectMember = (memberId) => {
    console.log("Manually selecting member with ID:", memberId,{members});
    const selectedMember = members.find((member) => member?.id === memberId);
    if (selectedMember) {
      setCurrentMember(selectedMember);
    } else {
      console.warn("No member found with the provided ID:", memberId);
    }
  };

  return (
    <MemberContext.Provider
      value={{
        members,
        currentMember,
        generateMembers,
        selectMember,
        selectRandomMember,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};

// Custom Hook for easy access
export const useMembers = () => {
  return useContext(MemberContext);
};

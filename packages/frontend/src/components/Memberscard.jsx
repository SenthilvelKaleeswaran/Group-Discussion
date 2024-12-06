import React from "react";
import { useMembers } from "../context/member";

const MemberCard = () => {
  const { members, currentMember } = useMembers();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 py-8 bg-gray-900">
      {members.map((member) => {
        const isCurrentMember = member.id === currentMember?.id;

        return (
          <div
            key={member.id}
            className={`p-6 text-center shadow-lg rounded-lg transition transform ${
              isCurrentMember
                ? "bg-blue-700 border-4 border-blue-400 hover:shadow-xl"
                : "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:shadow-xl hover:from-gray-700"
            } hover:-translate-y-1`}
          >
            <div
              className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full shadow-inner ${
                isCurrentMember ? "bg-gray-100 text-blue-700" : "bg-blue-600 text-gray-100"
              }`}
            >
              <span className="font-bold text-xl">
                {member.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2
              className={`text-lg font-semibold mb-2 ${
                isCurrentMember ? "text-gray-100" : "text-gray-300"
              }`}
            >
              {member.name}
            </h2>
            <p className={`text-sm ${isCurrentMember ? "text-gray-200" : "text-gray-500"}`}>
              ID: {member.id}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MemberCard;

import React from "react";

export const MemberCard = ({ data, currentMember }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 py-8 bg-gray-900">
      {data?.map((member) => {
        const isCurrentMember = member?._id === currentMember?._id;

        return (
          <div
            key={member.id}
            className={`p-6 text-center shadow-lg rounded-lg transition transform relative ${
              isCurrentMember
                ? "bg-blue-700 border-4 border-blue-400 hover:shadow-xl"
                : "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:shadow-xl hover:from-gray-700"
            } hover:-translate-y-1`}
          >
            <div
              className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full shadow-inner ${
                isCurrentMember
                  ? "bg-gray-100 text-blue-700"
                  : "bg-blue-600 text-gray-100"
              }`}
            >
              <span className="font-bold text-xl">
                {member?.name
                  ?.split(" ")
                  ?.slice(0, 2)
                  ?.map((word) => word.charAt(0).toUpperCase())
                  .join("")}
              </span>
            </div>

            <h2
              className={`text-lg font-semibold mb-2 ${
                isCurrentMember ? "text-gray-100" : "text-gray-300"
              }`}
            >
              {member.name}
            </h2>

            {/* AI/User Badge */}
            <span
              className={`absolute right-2 top-2 px-3 py-0.5 text-xs font-semibold rounded-full ${
                member.type === "AI"
                  ? "bg-yellow-500 text-red-900"
                  : member.type === "User"
                  ? "bg-purple-500 text-purple-900"
                  : "bg-lime-300 text-green-900"
              }`}
            >
              {member.type}
            </span>
          </div>
        );
      })}
    </div>
  );
};

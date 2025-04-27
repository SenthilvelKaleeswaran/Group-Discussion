import React from "react";
import Icon from "../../../icons";

export const MemberCard = ({ data, currentMember }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-5 gap-6 px-8 py-8">
      {data?.map((member) => {
        const isCurrentMember = member?._id === currentMember?._id;

        return (
          <div className="space-y-2 transition transform hover:-translate-y-1">
            <div
              key={member.id}
              className={`text-center flex justify-center items-center shadow-lg rounded-lg w-[200px] h-[150px] transition transform relative ${
                isCurrentMember
                  ? "bg-blue-900 border-4 border-blue-400 hover:shadow-xl"
                  : "bg-gray-900 hover:shadow-xl"
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

              <div className="rounded-full bg-violet-500 absolute right-2 top-2 p-1 border-2 border-violet-900 text-violet-900">
                <Icon name="Robot" />
              </div>
            </div>
            <div className="flex gap-2  transition transform w-[200px]">
              <div className="rounded-full bg-gray-900 p-1 px-2 w-[90%] drop-shadow-xl transition transform">
                <p className="text-left text-xs truncate "> {member.name}</p>
              </div>
              <div className="rounded-full bg-gray-900 px-1.5 drop-shadow-xl transition transform">
                <p className="text-left text-xs truncate ">...</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

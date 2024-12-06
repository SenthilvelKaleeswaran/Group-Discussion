import React from "react";
import { useMembers } from "../context/member";
import { useConversation } from "../context/conversation";

const Conversion = () => {
  const { conversation } = useConversation();
  const reversedConversation = [...(conversation || [])].reverse();
  console.log({conversation})

  return (
    <div className="flex flex-col gap-4 px-4 py-8 bg-gray-900">
      {reversedConversation?.map((data, index) => {
        
        return (
          <div
            key={data?.name + index}
            className={`p-2 text-center space-y-2 shadow-lg rounded-lg transition transform hover:-translate-y-1`}
          >
            <div className="flex gap-4 items-center justify-between w-full">
              <div className="flex gap-2 items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full shadow-inner  ${data?.name === 'Senthilvel' ? 'bg-blue-500 ' : 'bg-gray-500'} `}
                >
                  <span className="font-bold">{data?.name.slice(0, 1).toUpperCase()}</span>
                </div>
                <span className={`font-bold ${data?.name === 'Senthilvel' ? 'text-blue-700' : 'bg-gray-700'} `}>{data?.name}</span>
              </div>
              <p className={`text-xs rounded-full bg-blue-500 px-1.5 py-0.5`}>
                {conversation?.length - index}
              </p>
            </div>

            <p className={`text-sm ${data?.name === 'Senthilvel' ? 'bg-blue-800 text-right' : 'bg-gray-800 text-left'}  p-2 rounded-md`}>
              {data?.conversation || "No conversation available"}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Conversion;

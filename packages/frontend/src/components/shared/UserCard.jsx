import React from "react";
import Icon from "../../icons";
import { RenderSpace } from "./RenderSpace";

export function UserCard({ name, type, email, aiId }) {
  return (
    <div className="flex gap-2 items-center">
      <div className="rounded-full p-2 border hover:bg-gray-900 bg-gray-800">
        {type === "AI" || aiId ? (
          <Icon name="Robot" className="text-purple-600" />
        ) : (
          <Icon name="User" />
        )}
      </div>
      <div className="w-[90%]">
        <p className="text-normal text-left text-semibold truncate">{name || email}</p>
        <p className="text-sm text-left text-gray-500">
          {type === "AI" || aiId ? "AI" : name && email && email}
        </p>
      </div>
      <p></p>
    </div>
  );
}

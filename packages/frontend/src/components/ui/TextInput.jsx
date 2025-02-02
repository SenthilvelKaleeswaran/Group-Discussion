import React, { useEffect, useState } from "react";
import { RenderSpace } from "../shared";
import Icon from "../../icons";
import InputHeader from "./InputHeaders";

const TextInput = ({ label, id, className, ...rest }) => {
  const { disabled } = rest;
  console.log({ restfild: rest,name : rest?.name });

  return (
    <div className="w-full">
      <InputHeader field={{ ...rest, label, id }} />
      <input
        id={id}
        {...rest}
        className={`w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "focus:ring-blue-600"
        } transition duration-200 ease-in-out shadow-sm ${className}`}
      />
    </div>
  );
};

export default TextInput;

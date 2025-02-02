import React from "react";
import { RenderSpace } from "../shared";

// interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   label?: string;
//   className?: string;
// }

export const Checkbox = ({ label, id, className, ...rest }) => {
  return (
    <label
      htmlFor={id}
      className="flex gap-2 items-start text-lg text-left font-medium text-gray-700 cursor-pointer w-fit"
    >
      <input
        id={id}
        type="checkbox"
        {...rest}
        className={`h-5 w-5 text-blue-500 focus:ring-2 ${
          rest?.disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "focus:ring-blue-500"
        } transition duration-200 ease-in-out shadow-sm cursor-pointer rounded-lg mt-2 accent-black ${className}`}
      />
      <span >{label}</span>
    </label>
  );
};

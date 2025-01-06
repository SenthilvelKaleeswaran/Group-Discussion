import React from "react";
import { RenderSpace } from "../shared";

// interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   label?: string; 
//   className?: string;
// }

const TextInput = ({
  label,
  id,
  className,
  ...rest
}) => {
  return (
    <div>
      <RenderSpace condition={label}>
        <label
          htmlFor={id}
          className="block text-lg text-left font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      </RenderSpace>
      <input
        id={id}
        {...rest}
        className={`w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${
          rest?.disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "focus:ring-blue-500"
        } transition duration-200 ease-in-out shadow-sm ${className}`}
      />
    </div>
  );
};

export default TextInput;

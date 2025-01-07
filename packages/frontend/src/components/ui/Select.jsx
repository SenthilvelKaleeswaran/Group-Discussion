import React from "react";
import { RenderSpace } from "../shared";

export const Select = ({
  id,
  label,
  value,
  onChange,
  options,
  className = "",
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
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm  ${className}`}
        {...rest}
      >
        <option value="" disabled hidden>
          {rest?.placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={`py-4 cursor-pointer ${
              value === option.value
                ? "bg-blue-100 text-blue-700"
                : "bg-transparent"
            }`}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

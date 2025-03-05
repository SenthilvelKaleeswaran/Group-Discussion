import { IconWithLoader } from "./VariantsIcon";
import { Button } from "../ui";
import { useEffect, useRef, useState } from "react";
import Icon from "../../icons";

export const ButtonIcon = ({
  isLoading,
  name,
  className,
  iconClassName,
  ...rest
}) => {
  return (
    <Button {...rest} className={`p-0 px-0 py-0 ${className}`}>
      <IconWithLoader
        isLoading={isLoading}
        name={name}
        className={iconClassName}
      />
    </Button>
  );
};


export const ButtonDropdown = ({
  options = [],
  defaultLabel = "Select",
  defaultOption = "",
  className,
  disabled,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const buttonRef = useRef(null);
  const [dropdownWidth, setDropdownWidth] = useState("auto");

  useEffect(() => {
    const newSelectedOption =
      defaultOption !== "no_id"
        ? options.find((option) => option.id === defaultOption) || options[0]
        : null;
    setSelectedOption(newSelectedOption);
  }, [options, defaultOption]);

  useEffect(() => {
    if (buttonRef.current) {
      setDropdownWidth(`${buttonRef.current.offsetWidth}px`);
    }
  }, [isOpen, selectedOption]);

  const handleOptionClick = (option) => {
    if (option.disabled || disabled) return;
    setSelectedOption(option);
    option.onClick(); 
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <div
        className="flex bg-blue-500 hover:bg-blue-700 rounded-lg"
        ref={buttonRef}
      >
        <Button
          onClick={() => selectedOption?.onClick?.()} // Optional chaining to handle null
          className={`flex items-center justify-between rounded-r-none gap-2 ${className}`}
          disabled={disabled || loading || !selectedOption} // Disable if no option
        >
          <p>{selectedOption?.label || defaultLabel}</p>
        </Button>
        <Button onClick={() => setIsOpen((prev) => !prev)} disabled={loading}>
          <Icon
            name={loading ? "Loader" : isOpen ? "ChevronUp" : "ChevronDown"}
            className={loading ? "animate-spin" : ""}
          />
        </Button>
      </div>
      {isOpen && (
        <div
          className="absolute left-0 mt-2 bg-blue-500 border shadow-lg z-10 min-w-48 p-2"
          style={{ width: dropdownWidth }}
        >
          {options.map((option) => (
            <button
              key={option.id}
              className={`w-full px-4 py-2 text-left flex items-center justify-between rounded-none ${
                option.disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-blue-400"
              }`}
              onClick={() => handleOptionClick(option)}
              disabled={option.disabled}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

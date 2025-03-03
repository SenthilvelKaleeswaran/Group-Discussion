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
  loading = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);
  const buttonRef = useRef(null);
  const [dropdownWidth, setDropdownWidth] = useState("auto");

  console.log({ buttonRef });

  const getDefaultOption = () => {
    let option = null;
    if (!disabled) {
      if (!defaultOption) {
        option = options[0];
      } else {
        option = options?.find((_) => _?.id === defaultOption);
      }
    }

    setSelectedOption(option);
  };

  useEffect(() => {
    getDefaultOption();
  }, [defaultOption, disabled]);

  useEffect(() => {
    if (buttonRef.current) {
      console.log({ bbbbbbbb: buttonRef.current.offsetWidth });
      setDropdownWidth(`${buttonRef.current.offsetWidth}px`);
    }
  }, [isOpen,selectedOption]);

  const handleOptionClick = (option) => {
    if (option.disabled || disabled) return; // Prevent closing when selecting a disabled option
    setSelectedOption(option);
    setIsOpen(false);
    option.onClick && option.onClick(); // Execute onClick if provided
  };

  console.log({ options, selectedOption });

  return (
    <div className="relative inline-block">
      <div
        className="flex bg-blue-500 hover:bg-blue-700 rounded-md"
        ref={buttonRef}
      >
        <Button
          onClick={() => selectedOption?.onClick()}
          className={`flex items-center justify-between rounded-r-none gap-2 ${className}`}
          disabled={disabled || loading}
        >
          <p>{selectedOption?.label || defaultLabel}</p>
        </Button>
        <Button
          ref={buttonRef}
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={loading}
        >
          <Icon
            name={loading ? "Loader" : isOpen ? "ChevronUp" : "ChevronDown"}
            className={` ${loading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {isOpen && (
        <div
          className="absolute left-0 mt-2 bg-blue-500 border rounded shadow-lg z-10 min-w-48 p-2"
          style={{ width: dropdownWidth }} // Set dropdown width to match button
        >
          {options.map((option) => (
            <button
              key={option.id}
              className={`w-full px-4 py-2 text-left flex items-center justify-between rounded-none ${
                option.disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-blue-400"
              } ${option.className || ""}`}
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

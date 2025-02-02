import React, { createContext, useContext, useState } from "react";
import { RenderSpace } from "../shared";
import { useOutsideClickListener } from "../../hooks";
import Icon from "../../icons";
import { TextInput } from ".";

// Create Contexts
const SelectContext = createContext();

const Select = ({
  id,
  label,
  value,
  onChange,
  options = [],
  className = "",
  children,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const outsideClikRef = useOutsideClickListener(closeMenu);

  const isGroupped =
    Array.isArray(options) && options?.length > 0 && !!options[0]?.options;

  return (
    <SelectContext.Provider
      value={{
        id,
        value,
        onChange,
        isOpen,
        toggleOpen,
        closeMenu,
        options,
        isGroupped,
        label,
        ...rest,
      }}
    >
      <div className={`relative w-full ${className}`} ref={outsideClikRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const Trigger = ({ children, className, disabled }) => {
  const {
    isOpen,
    toggleOpen,
    value,
    options,
    isGroupped,
    label,
    id,
    hideCorrection,
    required,
  } = useContext(SelectContext);
  console.log({ hideCorrection });

  const selectedOption = isGroupped
    ? options?.find((item) => {
        return item?.options?.find((option) => option.value === value);
      })
    : options?.find((item) => {
        return item.value === value;
      });

  const displayValue = selectedOption ? selectedOption.label : children;

  return (
    <div
      className="flex items-center justify-between w-full relative"
      onClick={toggleOpen}
    >
      <TextInput
        id={id}
        name={id}
        type="text"
        value={displayValue}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        label={label}
        readOnly
        required={required}
        hideCorrection={hideCorrection}
        className={"w-full cursor-pointer"}
      />
      <Icon
        name={isOpen ? "ChevronUp" : "ChevronDown"}
        className={`w-3 absolute bottom-5 right-4 h-3 ${
          disabled ? "text-gray-500" : "text-white"
        }`}
      />
    </div>
  );
};

const Options = ({ children }) => {
  const { isOpen } = useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <ul className="absolute mt-1 py-2 space-y-2 w-full bg-black border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-10 px-2">
      {children}
    </ul>
  );
};

const Option = ({ children, value, disabled }) => {
  const {
    id,
    onChange,
    closeMenu,
    value: selectedValue,
  } = useContext(SelectContext);

  const handleSelect = () => {
    if (!disabled) {
      onChange({ name: id, value });
      closeMenu();
    }
  };

  const isSelected = value === selectedValue;

  return (
    <li
      onClick={handleSelect}
      className={`px-4 py-2 cursor-pointer text-left rounded-md text-ellipsis ${
        disabled
          ? "text-gray-400 cursor-not-allowed"
          : isSelected
          ? "bg-blue-500 text-white"
          : "hover:bg-blue-600 hover:text-white"
      }`}
    >
      {children}
    </li>
  );
};

const Group = ({ label, separator, children }) => {
  return (
    <div className="py-2 px-1">
      <RenderSpace condition={separator}>
        <hr className="border-t border-gray-500 px-2 " />
      </RenderSpace>
      <RenderSpace condition={label}>
        <div className="py-1 text-sm text-left font-semibold text-gray-600">
          {label}
        </div>
      </RenderSpace>

      <ul className="">{children}</ul>
    </div>
  );
};

const DropdownSelect = ({ options, placeholder, ...rest }) => {
  const isGrouped = Array.isArray(options) && options[0]?.options;

  const renderOptions = (options) => {
    return options.map((option) => (
      <Option key={option.value} value={option.value}>
        {option.label}
      </Option>
    ));
  };

  return (
    <Select {...rest} options={options}>
      <Trigger>{placeholder}</Trigger>
      <Options>
        {isGrouped
          ? options.map((group) => (
              <Group
                key={group.id}
                label={group.label}
                separator={group.separator}
              >
                {renderOptions(group.options)}
              </Group>
            ))
          : renderOptions(options)}
      </Options>
    </Select>
  );
};

export { Select, Trigger, Options, Option, Group, DropdownSelect };

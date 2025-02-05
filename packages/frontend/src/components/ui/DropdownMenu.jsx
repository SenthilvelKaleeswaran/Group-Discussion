import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { RenderSpace } from "../shared";
import Icon from "../../icons";

// Context for managing dropdown state
const DropdownContext = createContext({ isOpen: false, toggle: () => {} });

const Dropdown = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  return (
    <DropdownContext.Provider value={{ isOpen, toggle: toggleDropdown }}>
      <div className="relative" ref={menuRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

const DropdownMenuTrigger = ({ trigger, children }) => {
  const { toggle } = useContext(DropdownContext);

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 rounded-md text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 p-4"
    >
      {trigger || children}{" "}
      {/* Render the trigger prop if it exists, otherwise render children */}
    </button>
  );
};

const DropdownMenuContent = ({ children, position = "left" }) => {
  const { isOpen } = useContext(DropdownContext);

  // Define position styles
  const positionClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 transform -translate-x-1/2",
  };

  return isOpen ? (
    <div
      className={`absolute mt-2 w-48 rounded-md drop-shadow-2xl p-2 bg-gray-800 shadow-lg z-10 ${positionClasses[position]}`}
    >
      {children}
    </div>
  ) : null;
};

const DropdownMenuItem = ({ children, onClick, className = "" }) => (
  <div
    onClick={onClick}
    className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-900 rounded-md ${className}`}
  >
    {children}
  </div>
);

const DropdownMenuLabel = ({ children }) => (
  <div className="px-4 py-2 text-xs font-semibold text-gray-500">
    {children}
  </div>
);

const DropdownMenuSeparator = () => (
  <div className="my-1 h-px bg-gray-200"></div>
);

const DropdownMenuGroup = ({ children }) => (
  <div className="py-1">{children}</div>
);

const DropdownMenu = ({ trigger, options, position = "left" }) => {
  return (
    <Dropdown>
      <DropdownMenuTrigger trigger={trigger} />
      <DropdownMenuContent position={position}>
        {options.map((option, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => option.onClick()}
            className="flex gap-2 items-center"
          >
            <RenderSpace condition={option?.icon}>
              <Icon name={option.icon} />
            </RenderSpace>

            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </Dropdown>
  );
};

export {
  Dropdown,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenu,
};

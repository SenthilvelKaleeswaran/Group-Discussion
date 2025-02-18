import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { RenderSpace } from "./RenderSpace";
import Icon from "../../icons";
import { IconContainer } from "./VariantsIcon";

export const DoubleTapPopup = ({
  onKey,
  children,
  draggable = false,
  draggableOptions = {},
  iconName = "",
  title = "",
  containerClass = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChildren, setShowChildren] = useState(true); // New state to toggle children visibility
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const keyPressRef = useRef(null);

  // Toggle popup open/close on double-tap key
  const handleKeyPress = (event) => {
    if (event.key.toLowerCase() === onKey) {
      if (keyPressRef.current) {
        clearTimeout(keyPressRef.current);
        keyPressRef.current = null;
        setIsOpen((prev) => !prev);
      } else {
        keyPressRef.current = setTimeout(() => {
          keyPressRef.current = null;
        }, 300);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleDrag = (e, data) => setPosition({ x: data.x, y: data.y });

  const handleToggleChildren = () => setShowChildren((prev) => !prev);

  const handleClosePopup = () => setIsOpen(false);

  const render = () => {
    return (
      <div
        className={`absolute w-96 flex gap-4 flex-col bg-green-700 z-50 rounded-md p-4  ${containerClass} ${
          showChildren ? "h-96" : "h-[74px]"
        }`}
      >
        <div className="flex justify-between items-center w-full bg-gray-900 rounded-md p-2">
          <div className="flex gap-2 items-center">
            <RenderSpace condition={iconName}>
              <Icon name={iconName} />
            </RenderSpace>
            <RenderSpace condition={title}>
              <p className="text-left">{title}</p>
            </RenderSpace>
          </div>

          <div className="flex gap-2 items-center bg-gray-900">
            <IconContainer
              name={showChildren ? "ChevronUp" : "ChevronDown"}
              onClick={handleToggleChildren}
              tooltip={showChildren ? "Hide content" : "Show content"}
              className="text-sm text-yellow-500"
              containerClass="border-0"
            />
            <IconContainer
              name="Close"
              onClick={handleClosePopup}
              tooltip="Close popup"
              className="text-red-500"
              containerClass="border-0"
            />
          </div>
        </div>
        <RenderSpace condition={showChildren}>{children}</RenderSpace>
      </div>
    );
  };

  return (
    <RenderSpace condition={isOpen}>
      {draggable ? (
        <Draggable
          defaultPosition={position}
          onStop={handleDrag}
          {...draggableOptions}
          defaultClassName="cursor-pointer"
          id={onKey}
        >
          {render()}
        </Draggable>
      ) : (
        render()
      )}
    </RenderSpace>
  );
};

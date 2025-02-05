import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { RenderSpace } from "./RenderSpace";

export const DoubleTapPopup = ({
  onKey,
  children,
  draggable = false,
  draggableOptions = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const keyPressRef = useRef(null);

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

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <RenderSpace condition={isOpen}>
      {draggable ? (
        <Draggable
          defaultPosition={position}
          onStop={handleDrag}
          {...draggableOptions}
          defaultClassName="cursor-pointer"
        >
          {children}
        </Draggable>
      ) : (
        children
      )}
    </RenderSpace>
  );
};

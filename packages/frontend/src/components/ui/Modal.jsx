import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

 const Modal = ({ children,disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ isOpen, setIsOpen,disabled }}>
      {children}
    </ModalContext.Provider>
  );
};

// **Modal Trigger Button**
const ModalTrigger = ({ children }) => {
  const { setIsOpen,disabled } = useContext(ModalContext);
  console.log({disabled})
  return (
    <button
      onClick={() => setIsOpen(true)}
      disabled={disabled}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
    >
      {children}
    </button>
  );
};

// **Modal Content**
const ModalContent = ({ children,className }) => {
  const { isOpen, setIsOpen } = useContext(ModalContext);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 w-full rounded-md">
      <div className={`bg-gray-900 rounded-lg shadow-lg w-96 ${className}`}>{children}</div>
    </div>
  );
};

// **Modal Header**
const ModalHeader = ({ children }) => {
  const { setIsOpen } = useContext(ModalContext);
  return (
    <div className="flex justify-between items-center px-4 py-2 gap-4 border-b w-full">
      {children}
      <button
        onClick={() => setIsOpen(false)}
        className="text-gray-600 hover:text-black"
      >
        x
      </button>
    </div>
  );
};

// **Modal Body**
const ModalBody = ({ children,className }) => <div className={`p-4 rounded-lg ${className}`}>{children}</div>;

// **Modal Footer**
const ModalFooter = ({ children }) => (
  <div className="px-4 py-2 border-t border-gray-700 flex justify-end gap-2">{children}</div>
);

export {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTrigger,
  ModalFooter,
};

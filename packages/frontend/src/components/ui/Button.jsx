import React, { forwardRef } from "react";

// interface ButtonProps {
//   label: string;
//   onClick: () => void;
//   className?: string;
//   variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'dotted';
// }

const Button = forwardRef(({ label, children, onClick, className = "", variant = "primary", type = "button", ...rest }, ref) => {
  const baseClasses = "px-4 py-2 rounded";
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-700",
    secondary: "bg-gray-500 text-white hover:bg-gray-700",
    success: "bg-green-500 text-white hover:bg-green-700",
    ghost: "bg-transparent text-gray-700 hover:bg-transparent border-0",
    outline: "border border-gray-500 text-gray-700 hover:bg-gray-100",
    dotted: "border-dotted border-2 border-gray-500 text-gray-700 hover:bg-gray-100",
    destructive: "bg-red-500 text-white hover:bg-red-700",
  };

  return (
    <button
      ref={ref} // ✅ Forwarding ref here
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${
        rest?.disabled ? "bg-opacity-50 hover:bg-opacity-50" : ""
      } ${className}`}
      type={type}
      {...rest}
    >
      {children || label}
    </button>
  );
});




export default Button;

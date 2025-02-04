import React from 'react';

// interface ButtonProps {
//   label: string;
//   onClick: () => void;
//   className?: string;
//   variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'dotted';
// }

const Button = ({ label,children, onClick, className = '', variant = 'primary',type='button',...rest }) => {
  const baseClasses = 'px-4 py-2 rounded';
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-700',
    secondary: 'bg-gray-500 text-white hover:bg-gray-700',
    success: 'bg-green-500 text-white hover:bg-green-700',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    outline: 'border border-gray-500 text-gray-700 hover:bg-gray-100',
    dotted: 'border-dotted border-2 border-gray-500 text-gray-700 hover:bg-gray-100',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      type={type}
      {...rest}
    >
      {children ||label}
    </button>
  );
};

export default Button;

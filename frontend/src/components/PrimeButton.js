import React from 'react';

const PrimeButton = ({ 
  children, 
  onClick, 
  type = "button",
  disabled = false,
  className = "",
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`capsule-button-primary ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default PrimeButton;

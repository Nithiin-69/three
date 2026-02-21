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
      {children}
    </button>
  );
};

export default PrimeButton;

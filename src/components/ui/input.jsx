import React from 'react';

export const Input = React.forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-200 ${className}`}
      {...props}
    />
  );
});

import React from 'react';

const variants = {
  default: 'bg-blue-600 hover:bg-blue-700 text-white',
  outline: 'border border-gray-300 hover:bg-gray-50',
  destructive: 'bg-red-600 hover:bg-red-700 text-white',
};

const sizes = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function Button({ variant = 'default', size = 'md', className = '', ...props }) {
  const v = variants[variant] ?? variants.default;
  const s = sizes[size] ?? sizes.md;
  return (
    <button
      className={`rounded-2xl font-medium shadow-sm transition ${v} ${s} ${className}`}
      {...props}
    />
  );
}

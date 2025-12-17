"use client";

import { FormEvent, ReactNode } from "react";

interface FormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
}

export default function Form({ onSubmit, children, className = "" }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
    </form>
  );
}

interface InputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function FormInput({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
}: InputProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FormButton({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  onClick,
  className = "",
}: ButtonProps) {
  const baseStyles = "w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg disabled:bg-gray-400",
    secondary: "bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg disabled:bg-gray-400",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white disabled:border-gray-400 disabled:text-gray-400",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
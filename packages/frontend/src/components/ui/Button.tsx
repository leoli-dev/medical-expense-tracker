import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variantClasses = {
  primary: "bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  ghost: "text-gray-600 hover:bg-gray-100 active:bg-gray-200",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}

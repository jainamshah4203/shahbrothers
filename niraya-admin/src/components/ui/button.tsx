import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({ variant = "default", size = "md", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-6",
  } as const;
  const variants = {
    default: "bg-black text-white hover:bg-black/90",
    outline: "border border-gray-300 hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
  } as const;
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  return <button className={cls} {...props} />;
};

import React from "react";
import { cn } from "@/lib/utils";

// Badge variants
const variantStyles = {
  default: "bg-gray-100 text-gray-800",
  primary: "bg-blue-100 text-blue-800",
  secondary: "bg-purple-100 text-purple-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-cyan-100 text-cyan-800",
  dark: "bg-gray-800 text-gray-100",
  light: "bg-white text-gray-800 border border-gray-200",
  // Add your app-specific themes
  "red-primary": "bg-red-500 text-white",
  "red-secondary": "bg-red-100 text-red-700",
  "red-tertiary": "bg-red-200 text-red-800",
};

// Badge sizes
const sizeStyles = {
  xs: "text-xs px-1.5 py-0.5",
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
  lg: "text-sm px-3 py-1",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  rounded?: "full" | "md" | "lg";
  withDot?: boolean;
  dotColor?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Badge({
  children,
  className,
  variant = "default",
  size = "md",
  rounded = "full",
  withDot = false,
  dotColor,
  icon,
  ...props
}: BadgeProps) {
  // Determine border radius based on the rounded prop
  const borderRadiusClass = {
    full: "rounded-full",
    md: "rounded-md",
    lg: "rounded-lg",
  }[rounded];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium",
        variantStyles[variant],
        sizeStyles[size],
        borderRadiusClass,
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn(
            "mr-1 h-1.5 w-1.5 rounded-full",
            dotColor || "bg-current"
          )}
        />
      )}
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;

import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className = "", ...props }) => {
  const base = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
  return <label className={`${base} ${className}`} {...props} />;
};

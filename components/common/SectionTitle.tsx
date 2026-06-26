import type { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
}

export default function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return (
    <h2 className={`section-title${className ? ` ${className}` : ""}`}>{children}</h2>
  );
}

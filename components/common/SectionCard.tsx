import type { HTMLAttributes, ReactNode } from "react";

interface SectionCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function SectionCard({
  children,
  className = "",
  ...props
}: SectionCardProps) {
  return (
    <div className={`section-card${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </div>
  );
}

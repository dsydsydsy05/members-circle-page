import type { ComponentProps, ReactNode } from "react";
import { Link } from "@tanstack/react-router";

type LiquidGlassButtonProps = Omit<ComponentProps<typeof Link>, "children" | "className"> & {
  className?: string;
  children: ReactNode;
};

export function LiquidGlassButton({ className = "", children, ...props }: LiquidGlassButtonProps) {
  return (
    <Link {...props} className={`signal-link ${className}`.trim()}>
      <span className="liquid-glass__fluid" aria-hidden="true" />
      <span className="liquid-glass__content">{children}</span>
    </Link>
  );
}

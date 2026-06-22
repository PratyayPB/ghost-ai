"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DialogPatternProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export default function DialogPattern({
  title,
  description,
  children,
  footer,
  className,
}: DialogPatternProps) {
  return (
    <div
      className={cn(
        "max-w-xl w-full rounded-lg bg-card text-card-foreground shadow-lg",
        className,
      )}
    >
      <div className="px-4 py-3 border-b border-border">
        {title ? <h3 className="text-sm font-medium">{title}</h3> : null}
        {description ? (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        ) : null}
      </div>

      <div className="p-4">{children}</div>

      {footer ? (
        <div className="px-4 py-3 border-t border-border bg-background/5">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

import React from "react";
import { Progress } from "@/components/ui/progress";

export default function ModuleShell({ title, subtitle, step, totalSteps, children }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Step {step} of {totalSteps}
          </div>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl text-foreground leading-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground text-[15px] leading-relaxed">{subtitle}</p>}
        {totalSteps > 1 && (
          <div className="mt-5">
            <Progress value={((step - 1) / totalSteps) * 100} className="h-1" />
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
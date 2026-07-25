import { cn } from "@workspace/ui/lib/utils";

export const WidgetHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <header className={cn(
      "bg-gradient-to-b from-aurora-cyan to-aurora-emerald! p-4", className,

    )}>
      {children}
    </header>
  );
};

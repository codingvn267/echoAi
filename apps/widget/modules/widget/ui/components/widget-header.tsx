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
      "bg-gradient-to-b from-[#7dd3e4] to-[#c4eef5]! p-4", className,

    )}>
      {children}
    </header>
  );
};

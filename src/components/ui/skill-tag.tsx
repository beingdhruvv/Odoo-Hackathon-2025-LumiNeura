import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const skillTagVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        offered: "bg-skill-offered-bg text-skill-offered border border-skill-offered/20",
        wanted: "bg-skill-wanted-bg text-skill-wanted border border-skill-wanted/20",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "offered",
      size: "default",
    },
  }
);

export interface SkillTagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skillTagVariants> {
  children: React.ReactNode;
}

function SkillTag({ className, variant, size, children, ...props }: SkillTagProps) {
  return (
    <div className={cn(skillTagVariants({ variant, size }), className)} {...props}>
      {children}
    </div>
  );
}

export { SkillTag, skillTagVariants };
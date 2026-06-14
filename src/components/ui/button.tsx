import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground hover:bg-primary/90",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				outline:
					"border border-border bg-transparent hover:bg-secondary/60",
				ghost: "bg-transparent hover:bg-secondary/60",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
				overlay:
					"border border-white/15 bg-black/45 text-white backdrop-blur-md hover:bg-black/65 [&_svg]:size-3.5",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 px-3",
				xs: "h-7 gap-1.5 px-2 text-xs",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-xs": "size-7",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => (
		<button
			ref={ref}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	),
);
Button.displayName = "Button";

export { buttonVariants };

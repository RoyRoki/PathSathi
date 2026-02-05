import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "default" | "lg" | "full";
}

export function Container({
    className,
    size = "default",
    children,
    ...props
}: ContainerProps) {
    const sizes = {
        sm: "max-w-3xl",
        default: "max-w-6xl",
        lg: "max-w-7xl",
        full: "max-w-full",
    };
    return (
        <div
            className={cn("mx-auto px-4 sm:px-6 lg:px-8", sizes[size], className)}
            {...props}
        >
            {children}
        </div>
    );
}

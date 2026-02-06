import { HTMLAttributes, forwardRef } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
    lines?: number;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
    (
        {
            variant = "rectangular",
            width,
            height,
            lines = 1,
            className = "",
            ...props
        },
        ref
    ) => {
        const baseClasses = "skeleton bg-foreground/10 animate-pulse";

        const variantClasses = {
            text: "h-4 rounded",
            circular: "rounded-full",
            rectangular: "rounded-lg"
        };

        const style: React.CSSProperties = {
            width: width || (variant === "text" ? "100%" : undefined),
            height: height || (variant === "circular" ? width : undefined)
        };

        if (variant === "text" && lines > 1) {
            return (
                <div ref={ref} className={`space-y-2 ${className}`} {...props}>
                    {Array.from({ length: lines }).map((_, index) => (
                        <div
                            key={index}
                            className={`${baseClasses} ${variantClasses.text}`}
                            style={{
                                width: index === lines - 1 ? "80%" : "100%"
                            }}
                        />
                    ))}
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={`${baseClasses} ${variantClasses[variant]} ${className}`}
                style={style}
                {...props}
            />
        );
    }
);

Skeleton.displayName = "Skeleton";

// Pre-built skeleton patterns
const CardSkeleton = () => (
    <div className="clay-card rounded-2xl p-6 space-y-4">
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="text" lines={1} />
        <Skeleton variant="text" lines={2} />
        <div className="flex gap-2">
            <Skeleton variant="rectangular" width={80} height={32} />
            <Skeleton variant="rectangular" width={80} height={32} />
        </div>
    </div>
);

const TableRowSkeleton = () => (
    <div className="border-b border-border py-4 flex items-center gap-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
        </div>
        <Skeleton variant="rectangular" width={100} height={36} />
    </div>
);

const ProfileSkeleton = () => (
    <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="200px" />
            <Skeleton variant="text" width="150px" />
        </div>
    </div>
);

const GridSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
            <CardSkeleton key={index} />
        ))}
    </div>
);

export { Skeleton, CardSkeleton, TableRowSkeleton, ProfileSkeleton, GridSkeleton };

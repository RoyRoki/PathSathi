import { HTMLAttributes, forwardRef } from "react";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
    (
        {
            icon,
            title,
            description,
            action,
            className = "",
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={`text-center py-12 ${className}`}
                {...props}
            >
                {/* Icon */}
                {icon && (
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foreground/10 flex items-center justify-center">
                        {icon}
                    </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

                {/* Description */}
                {description && (
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
                )}

                {/* Action */}
                {action && (
                    <button
                        onClick={action.onClick}
                        className="px-6 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
                    >
                        {action.label}
                    </button>
                )}
            </div>
        );
    }
);

EmptyState.displayName = "EmptyState";

// Pre-built empty states
const NoRoutesEmpty = ({ onAction }: { onAction?: () => void }) => (
    <EmptyState
        icon={
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        }
        title="No routes yet"
        description="Start by creating your first route or browse the marketplace"
        action={onAction ? { label: "Browse Routes", onClick: onAction } : undefined}
    />
);

const NoDataEmpty = ({ title, description }: { title?: string; description?: string }) => (
    <EmptyState
        icon={
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
        }
        title={title || "No data available"}
        description={description || "There's nothing to show here yet"}
    />
);

const AllCaughtUpEmpty = () => (
    <EmptyState
        icon={
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        }
        title="All caught up!"
        description="You've completed everything. Great work!"
    />
);

export { EmptyState, NoRoutesEmpty, NoDataEmpty, AllCaughtUpEmpty };

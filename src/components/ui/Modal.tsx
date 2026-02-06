import { forwardRef } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";

export interface ModalProps extends HTMLMotionProps<"div"> {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    showCloseButton?: boolean;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
    (
        {
            isOpen,
            onClose,
            title,
            children,
            size = "md",
            showCloseButton = true,
            className = "",
            ...props
        },
        ref
    ) => {
        if (!isOpen) return null;

        const sizeClasses = {
            sm: "max-w-md",
            md: "max-w-2xl",
            lg: "max-w-4xl",
            xl: "max-w-6xl"
        };

        return (
            <>
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
                    <motion.div
                        ref={ref}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`clay-card rounded-3xl p-8 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto pointer-events-auto ${className}`}
                        onClick={(e) => e.stopPropagation()}
                        {...props}
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between mb-6">
                                {title && <h2 className="text-2xl font-bold">{title}</h2>}
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-foreground/5 rounded-lg transition-colors ml-auto"
                                        aria-label="Close modal"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div>{children}</div>
                    </motion.div>
                </div>
            </>
        );
    }
);

Modal.displayName = "Modal";

export { Modal };

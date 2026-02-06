import { InputHTMLAttributes, forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            leftIcon,
            rightIcon,
            helperText,
            className = "",
            type = "text",
            ...props
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
        const hasValue = props.value !== undefined && props.value !== "";
        const hasPlaceholder = props.placeholder !== undefined && props.placeholder !== "";
        const shouldFloat = isFocused || hasValue || hasPlaceholder;

        const isPasswordType = type === "password";
        const inputType = isPasswordType && showPassword ? "text" : type;

        return (
            <div className="relative w-full">
                <div className="relative">
                    {/* Left Icon */}
                    {leftIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            {leftIcon}
                        </div>
                    )}

                    {/* Input Field */}
                    <input
                        ref={ref}
                        type={inputType}
                        className={`
              w-full rounded-xl border bg-white px-4 py-3 text-base text-foreground
              transition-all duration-300
              ${leftIcon ? "pl-11" : ""}
              ${rightIcon || isPasswordType ? "pr-11" : ""}
              ${error
                                ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                                : "border-border focus:border-accent focus:ring-2 focus:ring-accent/20"
                            }
              ${label ? "pt-6" : ""}
              outline-none
              ${className}
            `}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        {...props}
                    />

                    {/* Floating Label */}
                    {label && (
                        <motion.label
                            className={`
                absolute left-4 pointer-events-none origin-left
                transition-all duration-200
                ${leftIcon ? "left-11" : "left-4"}
                ${shouldFloat
                                    ? "top-2 text-xs text-muted-foreground"
                                    : "top-1/2 -translate-y-1/2 text-base text-muted-foreground"
                                }
              `}
                            animate={{
                                fontSize: shouldFloat ? "0.75rem" : "1rem",
                                top: shouldFloat ? "0.5rem" : "50%",
                                transform:
                                    shouldFloat
                                        ? "translateY(0)"
                                        : "translateY(-50%)"
                            }}
                        >
                            {label}
                        </motion.label>
                    )}

                    {/* Right Icon / Password Toggle */}
                    {isPasswordType ? (
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            )}
                        </button>
                    ) : (
                        rightIcon && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                {rightIcon}
                            </div>
                        )
                    )}
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-1.5 text-sm text-error flex items-center gap-1"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* Helper Text */}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-muted-foreground">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Stagger fade-in animation for lists/grids
 */
export const staggerFadeIn = (
    targets: string | Element | Element[],
    options?: {
        duration?: number;
        stagger?: number;
        delay?: number;
        y?: number;
    }
) => {
    const { duration = 0.6, stagger = 0.1, delay = 0, y = 20 } = options || {};

    return gsap.from(targets, {
        opacity: 0,
        y,
        duration,
        stagger,
        delay,
        ease: "power2.out"
    });
};

/**
 * Text reveal animation (split by lines/words)
 */
export const textReveal = (
    target: string | Element,
    options?: {
        duration?: number;
        delay?: number;
        stagger?: number;
    }
) => {
    const { duration = 0.8, delay = 0, stagger = 0.05 } = options || {};

    return gsap.from(target, {
        opacity: 0,
        y: 30,
        duration,
        delay,
        stagger,
        ease: "power3.out"
    });
};

/**
 * Scroll-triggered parallax effect
 */
export const parallaxScroll = (
    target: string | Element,
    options?: {
        yStart?: number;
        yEnd?: number;
        start?: string;
        end?: string;
    }
) => {
    const { yStart = 0, yEnd = 100, start = "top bottom", end = "bottom top" } = options || {};

    return gsap.fromTo(
        target,
        { y: yStart },
        {
            y: yEnd,
            scrollTrigger: {
                trigger: target,
                start,
                end,
                scrub: true
            }
        }
    );
};

/**
 * Magnetic hover effect for buttons
 */
export const magneticHover = (button: HTMLElement, strength: number = 0.3) => {
    const handleMouseMove = (e: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(button, {
            x: x * strength,
            y: y * strength,
            duration: 0.3,
            ease: "power2.out"
        });
    };

    const handleMouseLeave = () => {
        gsap.to(button, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
        });
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
        button.removeEventListener("mousemove", handleMouseMove);
        button.removeEventListener("mouseleave", handleMouseLeave);
    };
};

/**
 * Counter animation (for stats)
 */
export const counterAnimation = (
    target: string | Element,
    options?: {
        start?: number;
        end?: number;
        duration?: number;
        decimals?: number;
    }
) => {
    const { start = 0, end = 100, duration = 2, decimals = 0 } = options || {};

    const obj = { value: start };
    const element = typeof target === "string" ? document.querySelector(target) : target;

    if (!element) return;

    return gsap.to(obj, {
        value: end,
        duration,
        ease: "power1.out",
        onUpdate: () => {
            element.textContent = obj.value.toFixed(decimals);
        }
    });
};

/**
 * Page transition fade
 */
export const pageTransition = (
    onComplete?: () => void
) => {
    const tl = gsap.timeline({
        onComplete
    });

    tl.to(".page-transition", {
        opacity: 1,
        duration: 0.3,
        ease: "power2.inOut"
    }).to(".page-transition", {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        delay: 0.3
    });

    return tl;
};

/**
 * Card hover tilt effect
 */
export const cardTilt = (card: HTMLElement, maxTilt: number = 5) => {
    const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        gsap.to(card, {
            rotateX,
            rotateY,
            duration: 0.3,
            ease: "power2.out",
            transformPerspective: 1000
        });
    };

    const handleMouseLeave = () => {
        gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
        card.removeEventListener("mousemove", handleMouseMove);
        card.removeEventListener("mouseleave", handleMouseLeave);
    };
};

/**
 * Scroll progress indicator
 */
export const scrollProgress = (
    target: string | Element,
    options?: {
        start?: string;
        end?: string;
    }
) => {
    const { start = "top top", end = "bottom bottom" } = options || {};

    return gsap.to(target, {
        scaleX: 1,
        transformOrigin: "left center",
        ease: "none",
        scrollTrigger: {
            start,
            end,
            scrub: true
        }
    });
};

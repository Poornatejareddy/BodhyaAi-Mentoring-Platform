/**
 * Animation Utilities
 * CSS class utilities for smooth animations and transitions
 */

// Fade In Animations
export const fadeIn = {
    initial: "opacity-0",
    animate: "opacity-100 transition-opacity duration-500",
    enter: "animate-fade-in"
};

// Slide In Animations
export const slideInUp = {
    initial: "opacity-0 translate-y-4",
    animate: "opacity-100 translate-y-0 transition-all duration-500"
};

export const slideInDown = {
    initial: "opacity-0 -translate-y-4",
    animate: "opacity-100 translate-y-0 transition-all duration-500"
};

export const slideInLeft = {
    initial: "opacity-0 -translate-x-4",
    animate: "opacity-100 translate-x-0 transition-all duration-500"
};

export const slideInRight = {
    initial: "opacity-0 translate-x-4",
    animate: "opacity-100 translate-x-0 transition-all duration-500"
};

// Scale Animations
export const scaleIn = {
    initial: "opacity-0 scale-95",
    animate: "opacity-100 scale-100 transition-all duration-300"
};

// Hover Animations
export const hoverLift = "hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300";
export const hoverScale = "hover:scale-105 transition-transform duration-300";
export const hoverGlow = "hover:shadow-lg hover:shadow-[var(--shadow-md)] transition-shadow duration-300";

// Stagger Animation (for lists)
export const staggerDelay = (index) => ({
    style: { animationDelay: `${index * 100}ms` }
});

// Pulse Animation
export const pulse = "animate-pulse";

// Spin Animation
export const spin = "animate-spin";

// Bounce Animation
export const bounce = "animate-bounce";

// Custom Animations (add to tailwind.config.js)
export const customAnimations = {
    'fade-in': 'fadeIn 0.5s ease-in-out',
    'slide-up': 'slideUp 0.5s ease-out',
    'scale-in': 'scaleIn 0.3s ease-out'
};

// Usage helper
export const animateOnMount = (animation = 'fade-in') => {
    return `animate-${animation}`;
};

export default {
    fadeIn,
    slideInUp,
    slideInDown,
    slideInLeft,
    slideInRight,
    scaleIn,
    hoverLift,
    hoverScale,
    hoverGlow,
    pulse,
    spin,
    bounce,
    animateOnMount
};

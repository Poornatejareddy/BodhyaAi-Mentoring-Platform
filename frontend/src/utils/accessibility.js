/**
 * Accessibility Utilities
 * Helper functions and components for improved accessibility
 */

// Screen Reader Only Text
export const ScreenReaderOnly = ({ children }) => (
    <span className="sr-only">{children}</span>
);

// ARIA Labels Helper
export const ariaLabel = (label) => ({
    'aria-label': label
});

export const ariaDescribedBy = (id) => ({
    'aria-describedby': id
});

// Keyboard Navigation Helper
export const handleKeyPress = (callback, keys = ['Enter', ' ']) => (event) => {
    if (keys.includes(event.key)) {
        event.preventDefault();
        callback(event);
    }
};

// Focus Management
export const focusRing = "focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 focus:ring-offset-[var(--canvas)]";

export const skipToContent = "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--brand)] focus:text-[var(--ink)] focus:rounded-lg";

// Reduce Motion Support
export const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const motionSafe = (animationClass) => {
    return prefersReducedMotion() ? '' : animationClass;
};

// Color Contrast Utilities
export const highContrast = {
    text: "text-[var(--ink)]",
    bg: "bg-[var(--surface)]",
    border: "border-[var(--line)]"
};

// ARIA Live Regions
export const ariaLive = (politeness = 'polite') => ({
    'aria-live': politeness,
    'aria-atomic': 'true'
});

// Form Accessibility
export const formField = (id, label, error = null) => ({
    id,
    'aria-label': label,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': error ? `${id}-error` : undefined
});

// Loading State
export const loadingState = (isLoading, label = 'Loading') => ({
    'aria-busy': isLoading,
    'aria-label': isLoading ? label : undefined
});

// Expandable Sections
export const expandable = (isExpanded, controls) => ({
    'aria-expanded': isExpanded,
    'aria-controls': controls
});

export default {
    ScreenReaderOnly,
    ariaLabel,
    ariaDescribedBy,
    handleKeyPress,
    focusRing,
    skipToContent,
    prefersReducedMotion,
    motionSafe,
    highContrast,
    ariaLive,
    formField,
    loadingState,
    expandable
};

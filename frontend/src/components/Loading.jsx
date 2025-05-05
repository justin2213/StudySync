import React from "react";

/**
 * LoadingIndicator
 *
 * A simple animated loading indicator composed of three dots.
 *
 * - Container: `.loading-indicator` class for overall layout
 * - Dot: `.dot` class for individual dot elements and animations
 *
 * Usage:
 * ```jsx
 * <LoadingIndicator />
 * ```
 *
 *
 * @component
 * @returns {JSX.Element} The loading indicator element.
 */
const LoadingIndicator = () => (
  <div className="loading-indicator">
    {/* Three dot elements animated via CSS */}
    <span className="dot">.</span>
    <span className="dot">.</span>
    <span className="dot">.</span>
  </div>
);

export default LoadingIndicator;

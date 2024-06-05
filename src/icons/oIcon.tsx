"use client";

import React from "react"; // Make sure you've defined this utility function

export type IconProps = React.SVGProps<SVGSVGElement> & {
  strokeWidthPercentage?: number; // Between 0 and 1, representing the percentage of the radius
};

export const OIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, strokeWidthPercentage = 0.1, ...props }, ref) => {
    // Calculate the actual stroke width based on the radius and percentage
    const strokeWidth = 50 * strokeWidthPercentage;
    return (
      <svg
        ref={ref}
        {...props}
        className={className} // Tailwind classes will be applied here
        width="100%" // Set width to fill the parent
        height="100%" // Set height to fill the parent
        viewBox="-2 -2 104 104" // Set viewBox to the size of the circle to be drawn
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circle is drawn from the center (50,50) and will always fit within the viewBox */}
        <circle
          cx="50"
          cy="50"
          r={50 - strokeWidth / 2} // Adjust radius based on the stroke width
          stroke="currentColor" // Allows stroke color to be set with className
          strokeWidth={strokeWidth} // Defined by the strokeWidthPercentage prop
          fill="none" // Allows fill color to be set with className
        />
      </svg>
    );
  },
);

OIcon.displayName = "OIcon";

"use client";
import React from "react";

export type CrossProps = React.SVGProps<SVGSVGElement> & {
  lineThicknessRatio?: number; // Ratio of line thickness to the SVG's size
};

export const XIcon = React.forwardRef<SVGSVGElement, CrossProps>(
  ({ className, lineThicknessRatio = 0.02, ...props }, ref) => {
    const viewBoxSize = 100; // Dimension for the viewBox
    const lineThickness = viewBoxSize * lineThicknessRatio; // Line thickness relative to the viewBox
    const offset = lineThickness / 2; // Offset to avoid clipping at the edges

    // Adjusted start and end points for the lines to fit within the SVG viewable area
    const startOffset = offset;
    const endOffset = viewBoxSize - offset;

    return (
      <svg
        ref={ref}
        {...props}
        className={className}
        width="100%" // Set width to fill the parent
        height="100%" // Set height to fill the parent
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} // ViewBox to encompass the full cross dimensions
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Diagonal line from top left to bottom right */}
        <line
          x1={startOffset} // Offset from the left edge
          y1={startOffset} // Offset from the top edge
          x2={endOffset} // Offset from the right edge
          y2={endOffset} // Offset from the bottom edge
          stroke="currentColor" // Stroke color can be controlled via className
          strokeWidth={lineThickness} // Width of the line
        />
        {/* Diagonal line from top right to bottom left */}
        <line
          x1={endOffset} // Offset from the right edge
          y1={startOffset} // Offset from the top edge
          x2={startOffset} // Offset from the left edge
          y2={endOffset} // Offset from the bottom edge
          stroke="currentColor"
          strokeWidth={lineThickness} // Same width as the other line
        />
      </svg>
    );
  },
);

XIcon.displayName = "XIcon";

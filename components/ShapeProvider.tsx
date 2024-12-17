'use client';

import React from 'react';

export type ShapeType = 'circle' | 'square' | 'triangle' | 'star' | 'hexagon';

interface ShapeProviderProps {
  type: ShapeType;
  color: string;
  className?: string;
}

const shapes: Record<ShapeType, string> = {
  circle: "M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0",
  square: "M10,10 h80 v80 h-80 Z",
  triangle: "M50,10 L90,90 L10,90 Z",
  star: "M50,10 L61,40 L93,40 L67,60 L76,90 L50,73 L24,90 L33,60 L7,40 L39,40 Z",
  hexagon: "M50,10 L90,30 L90,70 L50,90 L10,70 L10,30 Z"
};

export const ShapeProvider: React.FC<ShapeProviderProps> = ({ 
  type, 
  color,
  className = "w-full h-full"
}) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      role="img"
      aria-label={`${type} shape`}
    >
      <path 
        d={shapes[type]} 
        fill={color}
        stroke="currentColor"
        strokeOpacity={0.1}
        strokeWidth="2"
      />
    </svg>
  );
};

// Utility function to get a random color from a predefined palette
export const getRandomColor = (): string => {
  const colors = [
    '#ef4444', // red
    '#3b82f6', // blue
    '#22c55e', // green
    '#f97316', // orange
    '#a855f7', // purple
    '#06b6d4', // cyan
    '#eab308', // yellow
    '#ec4899'  // pink
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Utility function to get a random shape
export const getRandomShape = (): ShapeType => {
  const shapes: ShapeType[] = ['circle', 'square', 'triangle', 'star', 'hexagon'];
  return shapes[Math.floor(Math.random() * shapes.length)];
};

export default ShapeProvider;
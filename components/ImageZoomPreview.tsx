'use client';

import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState } from 'react';


interface ImageZoomPreviewProps {
  imageName: string | null;
  imageUrl: string | null;
  position: { x: number; y: number };
  enabled: boolean;
}

export const ImageZoomPreview: React.FC<ImageZoomPreviewProps> = ({
  imageName,
  imageUrl,
  position,
  enabled
}) => {
  if (!enabled || !imageName || !imageUrl) return null;

  return (
    <div 
      className="fixed pointer-events-none z-50 bg-background border rounded-lg shadow-lg overflow-hidden"
      style={{
        width: '400px',
        height: '400px',
        left: position.x + 20,
        top: position.y - 200,
      }}
    >
      <img
        src={imageUrl}
        alt={imageName}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export const useZoomToggle = () => {
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'z') {
        const newState = !isZoomEnabled;
        setIsZoomEnabled(newState);
        toast({
          description: newState ? "Zoom preview enabled - hover over images to zoom" : "Zoom preview disabled",
          duration: 2000
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isZoomEnabled, toast]);

  return isZoomEnabled;
};

export default ImageZoomPreview;
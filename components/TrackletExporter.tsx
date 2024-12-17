'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ShapeType } from './ShapeProvider';

export interface TrackletImage {
  name: string;
  path: string;
  shape: ShapeType;
  color: string;
}

export interface Tracklet {
  tracklet_id: string;
  images: TrackletImage[];
}

interface TrackletExporterProps {
  tracklets: Tracklet[];
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const TrackletExporter: React.FC<TrackletExporterProps> = ({ 
  tracklets,
  className = '',
  variant = 'outline',
  size = 'sm'
}) => {
  const formatTrackletForExport = (tracklet: Tracklet): Tracklet => {
    // Sort images by name
    const sortedImages = [...tracklet.images].sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    return {
      tracklet_id: tracklet.tracklet_id,
      images: sortedImages.map(img => ({
        name: img.name,
        path: img.path,
        shape: img.shape,
        color: img.color
      }))
    };
  };

  const handleExport = () => {
    // Sort tracklets by ID
    const sortedTracklets = [...tracklets]
      .sort((a, b) => Number(a.tracklet_id) - Number(b.tracklet_id))
      .map(formatTrackletForExport);

    // Create the final export structure
    const exportData = {
      tracklets: sortedTracklets
    };

    // Convert to JSON string with proper formatting
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create and trigger download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    link.href = url;
    link.download = `tracklets-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button 
      onClick={handleExport}
      variant={variant}
      size={size}
      className={className}
      disabled={tracklets.length === 0}
    >
      <Download className="h-4 w-4 mr-2" />
      Download JSON
    </Button>
  );
};

export default TrackletExporter;
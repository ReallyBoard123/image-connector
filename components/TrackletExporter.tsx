'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Tracklet } from '@/lib/types';

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
    const sortedImages = [...tracklet.images].sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    return {
      tracklet_id: tracklet.tracklet_id,
      images: sortedImages.map(img => ({
        name: img.name
      }))
    };
  };

  const handleExport = () => {
    const sortedTracklets = [...tracklets]
      .sort((a, b) => Number(a.tracklet_id) - Number(b.tracklet_id))
      .map(formatTrackletForExport);

    const exportData = {
      tracklets: sortedTracklets
    };

    const jsonString = JSON.stringify(exportData, null, 2);
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
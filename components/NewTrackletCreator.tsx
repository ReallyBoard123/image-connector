'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Tracklet } from '@/lib/types';


interface NewTrackletCreatorProps {
  existingTracklets: Tracklet[];
  onNewTracklet: (newTracklet: Tracklet) => void;
  className?: string;
}

export const NewTrackletCreator: React.FC<NewTrackletCreatorProps> = ({
  existingTracklets,
  onNewTracklet,
  className = ''
}) => {
  const generateUniqueTrackletId = (): string => {
    const existingIds = existingTracklets.map(t => 
      parseInt(t.tracklet_id)
    ).filter(id => !isNaN(id));
    
    if (existingIds.length === 0) return "0";
    const maxId = Math.max(...existingIds);
    return (maxId + 1).toString();
  };

  const handleCreateNewTracklet = () => {
    const newTrackletId = generateUniqueTrackletId();
    const newTracklet: Tracklet = {
      tracklet_id: newTrackletId,
      images: []
    };
    onNewTracklet(newTracklet);
  };

  return (
    <Card className={`flex items-center justify-center ${className}`}>
      <CardContent className="p-6">
        <Button 
          onClick={handleCreateNewTracklet}
          variant="outline"
          size="lg"
          className="w-full h-full aspect-square min-h-[100px] flex flex-col gap-2"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm">New Tracklet</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default NewTrackletCreator;
import React, { useState, useEffect, useCallback } from 'react';
import { useTrackletStore } from '@/stores/useTrackletStore';
import { useToast } from '@/hooks/use-toast';
import useEditMode from '@/hooks/useEditMode';

export const useTrackletMerger = () => {
  const [selectedTracklets, setSelectedTracklets] = useState<Set<string>>(new Set());
  const { mergeTracklets, tracklets } = useTrackletStore();
  const { toast } = useToast();
  const { isEditModeEnabled } = useEditMode();

  const toggleTrackletSelection = useCallback((trackletId: string, event: React.MouseEvent) => {
    setSelectedTracklets(prev => {
      const newSelection = new Set(prev);
      if (event.ctrlKey || event.metaKey) {
        if (newSelection.has(trackletId)) {
          newSelection.delete(trackletId);
        } else {
          newSelection.add(trackletId);
        }
      } else {
        if (prev.size === 1 && prev.has(trackletId)) {
          newSelection.clear();
        } else {
          newSelection.clear();
          newSelection.add(trackletId);
        }
      }
      return newSelection;
    });
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'm' && selectedTracklets.size > 1 && !isEditModeEnabled) {
        const trackletIds = Array.from(selectedTracklets);
        const targetTrackletId = trackletIds[0];
        
        trackletIds.slice(1).forEach(sourceId => {
          mergeTracklets(sourceId, targetTrackletId);
        });

        setSelectedTracklets(new Set([targetTrackletId]));
        
        const targetTracklet = tracklets.find(t => t.tracklet_id === targetTrackletId);
        const displayName = targetTracklet?.tracklet_alias || targetTrackletId;
        
        toast({
          description: `Merged ${trackletIds.length - 1} tracklets into Tracklet ${displayName}`,
          duration: 2000
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedTracklets, mergeTracklets, toast, tracklets, isEditModeEnabled]);

  const isTrackletSelected = useCallback((trackletId: string) => {
    return selectedTracklets.has(trackletId);
  }, [selectedTracklets]);

  return {
    selectedTracklets,
    toggleTrackletSelection,
    isTrackletSelected
  };
};

interface TrackletMergeOverlayProps {
  isSelected: boolean;
  onClick: (event: React.MouseEvent) => void;
  children: React.ReactNode;
}

export const TrackletMergeOverlay: React.FC<TrackletMergeOverlayProps> = ({
  isSelected,
  onClick,
  children
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative transition-colors ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      {children}
    </div>
  );
};
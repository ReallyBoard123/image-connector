'use client';

import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

export const useEditMode = () => {
  const [isEditModeEnabled, setIsEditModeEnabled] = useState(false);
  const [selectedTrackletId, setSelectedTrackletId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'e' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault(); // Prevent browser's default behavior
        const newState = !isEditModeEnabled;
        setIsEditModeEnabled(newState);
        
        // Clear selected tracklet when disabling edit mode
        if (!newState) {
          setSelectedTrackletId(null);
        }
        
        toast({
          description: newState 
            ? "Edit mode enabled - click on tracklet names to edit" 
            : "Edit mode disabled",
          duration: 2000
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEditModeEnabled, toast]);

  const selectTrackletForEdit = (trackletId: string) => {
    if (isEditModeEnabled) {
      setSelectedTrackletId(trackletId);
    }
  };

  return {
    isEditModeEnabled,
    selectedTrackletId,
    selectTrackletForEdit,
    clearSelectedTracklet: () => setSelectedTrackletId(null)
  };
};

export default useEditMode;
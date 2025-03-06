'use client';

import { useState, useEffect } from 'react';
import { Tracklet } from '@/lib/types';

interface UploadStatistics {
  trackletCount: number;
  totalImageCount: number;
  matchedImagesCount: number;
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  handleConfirm: () => void;
  handleClear: () => void;
}

export const useUploadStatistics = (
  tracklets: Tracklet[],
  uploadedImages: Map<string, File>,
  clearTracklets: () => void,
  clearImages: () => void
): UploadStatistics => {
  const [showDialog, setShowDialog] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  // Count all images in tracklets
  const totalImageCount = tracklets.reduce(
    (count, tracklet) => count + tracklet.images.length,
    0
  );

  // Count only images that exist in the uploaded files
  const matchedImagesCount = tracklets.reduce((count, tracklet) => {
    return count + tracklet.images.filter(img => uploadedImages.has(img.name)).length;
  }, 0);

  // Show dialog when both tracklets and images are uploaded and not confirmed yet
  useEffect(() => {
    const hasTracklets = tracklets.length > 0;
    const hasImages = uploadedImages.size > 0;
    
    if (hasTracklets && hasImages && !hasConfirmed) {
      setShowDialog(true);
    }
  }, [tracklets, uploadedImages.size, hasConfirmed]);

  const handleConfirm = () => {
    setShowDialog(false);
    setHasConfirmed(true);
  };

  const handleClear = () => {
    clearTracklets();
    clearImages();
    setShowDialog(false);
    setHasConfirmed(false);
  };

  return {
    trackletCount: tracklets.length,
    totalImageCount,
    matchedImagesCount,
    showDialog,
    setShowDialog,
    handleConfirm,
    handleClear
  };
};

export default useUploadStatistics;
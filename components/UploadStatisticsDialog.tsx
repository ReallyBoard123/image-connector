'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UploadStatisticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackletCount: number;
  imageCount: number;
  matchedImagesCount: number;
  onConfirm: () => void;
  onClear: () => void;
}

const UploadStatisticsDialog: React.FC<UploadStatisticsDialogProps> = ({
  open,
  onOpenChange,
  trackletCount,
  imageCount,
  matchedImagesCount,
  onConfirm,
  onClear,
}) => {
  const hasMismatch = matchedImagesCount < imageCount || matchedImagesCount === 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasMismatch ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Upload Statistics
          </DialogTitle>
          <DialogDescription>
            Review the statistics for uploaded tracklets and images.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Tracklets</span>
              <Badge variant="outline" className="w-fit justify-center">
                {trackletCount}
              </Badge>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Total Images</span>
              <Badge variant="outline" className="w-fit justify-center">
                {imageCount}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Matched Images</span>
            <Badge 
              variant={hasMismatch ? "destructive" : "outline"} 
              className="w-fit justify-center"
            >
              {matchedImagesCount} / {imageCount}
            </Badge>
          </div>
          
          {hasMismatch && (
            <div className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 p-3 rounded-md">
              Warning: There's a mismatch between tracklet data and uploaded images. 
              Some images in the tracklet JSON don't match with the uploaded images.
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="destructive" onClick={onClear} className="sm:w-auto w-full">
            Clear All
          </Button>
          <Button onClick={onConfirm} className="sm:w-auto w-full">
            Confirm & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadStatisticsDialog;
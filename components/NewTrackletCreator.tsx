'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Tracklet } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewTrackletCreatorProps {
  className?: string;
}

export const NewTrackletCreator: React.FC<NewTrackletCreatorProps> = ({
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const [alias, setAlias] = useState('');
  // Import the specific parts of the store we need
  const createTracklet = React.useCallback((newTracklet: Tracklet) => {
    // Fetch the store only when needed to avoid unnecessary rerenders
    const { createTracklet } = require('@/stores/useTrackletStore').useTrackletStore.getState();
    createTracklet(newTracklet);
  }, []);

  const generateUniqueTrackletId = (): string => {
    // Get tracklets directly from store state to avoid subscription
    const { tracklets } = require('@/stores/useTrackletStore').useTrackletStore.getState();
    const existingIds = tracklets.map((t: Tracklet) => 
      parseInt(t.tracklet_id)
    ).filter((id: number) => !isNaN(id));
    
    if (existingIds.length === 0) return "0";
    const maxId = Math.max(...existingIds);
    return (maxId + 1).toString();
  };

  const handleOpenDialog = () => {
    setAlias(''); // Reset alias input
    setOpen(true);
  };

  const handleCreateTracklet = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTrackletId = generateUniqueTrackletId();
    const newTracklet: Tracklet = {
      tracklet_id: newTrackletId,
      tracklet_alias: alias.trim() || undefined, // Only set alias if not empty
      images: []
    };
    
    createTracklet(newTracklet);
    setOpen(false);
  };

  return (
    <>
      <Card className={`flex items-center justify-center ${className}`}>
        <CardContent className="p-6">
          <Button 
            onClick={handleOpenDialog}
            variant="outline"
            size="lg"
            className="w-full h-full aspect-square min-h-[100px] flex flex-col gap-2"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm">New Tracklet</span>
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateTracklet}>
            <DialogHeader>
              <DialogTitle>Create New Tracklet</DialogTitle>
              <DialogDescription>
                Add a new tracklet to your collection. You can optionally give it a descriptive alias.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alias" className="text-right">
                  Alias
                </Label>
                <Input 
                  id="alias" 
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Optional tracklet alias"
                  className="col-span-3" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Tracklet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewTrackletCreator;
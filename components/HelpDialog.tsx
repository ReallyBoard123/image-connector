'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

const HelpDialog: React.FC = () => {
  const controlGroups = [
    {
      title: 'Keyboard Controls',
      controls: [
        { key: 'Z', description: 'Toggle zoom preview mode' },
        { key: 'Ctrl/Cmd + E', description: 'Toggle edit mode for tracklet names' },
        { key: 'M', description: 'Merge selected tracklets' },
        { key: 'Ctrl/Cmd + Click', description: 'Select/deselect multiple tracklets or images' },
        { key: 'Shift + Click', description: 'Select a range of images' },
      ]
    },
    {
      title: 'Mouse Controls',
      controls: [
        { key: 'Drag & Drop', description: 'Move images between tracklets' },
        { key: 'Hover', description: 'View image details or preview (when zoom enabled)' },
        { key: 'Click on tracklet name', description: 'Edit tracklet name (when edit mode enabled)' }
      ]
    },
    {
      title: 'UI Controls',
      controls: [
        { key: 'Change Log', description: 'View history of tracklet changes' },
        { key: 'Download JSON', description: 'Export tracklets data' },
        { key: 'Merge into...', description: 'Combine tracklets' },
        { key: 'Navigation arrows', description: 'Browse through images in each tracklet' }
      ]
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Help">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tracklet Manager Controls</DialogTitle>
          <DialogDescription>
            Keyboard shortcuts and controls for managing tracklets
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {controlGroups.map((group, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-medium text-sm">{group.title}</h3>
              <div className="space-y-1">
                {group.controls.map((control, ctrlIndex) => (
                  <div key={ctrlIndex} className="grid grid-cols-3 gap-2 text-sm">
                    <div className="font-mono bg-muted px-2 py-0.5 rounded text-center">
                      {control.key}
                    </div>
                    <div className="col-span-2">
                      {control.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
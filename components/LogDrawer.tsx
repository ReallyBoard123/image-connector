'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, UndoIcon } from 'lucide-react';
import { useTrackletStore } from '@/stores/useTrackletStore';


export const LogDrawer: React.FC = () => {
  const { changes, undoChange } = useTrackletStore();

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          Change Log
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Change History</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-4">
            {changes.map((change, index) => (
              <div 
                key={change.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-card text-card-foreground"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {change.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(change.timestamp)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => undoChange(change.id)}
                  disabled={index !== changes.length - 1}
                  className="h-8 px-2"
                >
                  <UndoIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {changes.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No changes recorded yet
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
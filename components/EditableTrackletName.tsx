'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTrackletStore } from '@/stores/useTrackletStore';
import { useEditMode } from '@/hooks/useEditMode';

interface EditableTrackletNameProps {
  trackletId: string;
  alias?: string;
  className?: string;
}

const EditableTrackletName: React.FC<EditableTrackletNameProps> = ({
  trackletId,
  alias,
  className = ''
}) => {
  const { setTrackletAlias } = useTrackletStore();
  const { isEditModeEnabled, selectedTrackletId, selectTrackletForEdit, clearSelectedTracklet } = useEditMode();
  const [value, setValue] = useState(alias || trackletId);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = isEditModeEnabled && selectedTrackletId === trackletId;

  useEffect(() => {
    setValue(alias || trackletId);
  }, [alias, trackletId]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (isEditModeEnabled) {
      selectTrackletForEdit(trackletId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveChanges();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const handleBlur = () => {
    saveChanges();
  };

  const saveChanges = () => {
    clearSelectedTracklet();
    const trimmedValue = value.trim();
    
    if (trimmedValue && trimmedValue !== trackletId) {
      setTrackletAlias(trackletId, trimmedValue);
    } else if (!trimmedValue) {
      // Reset to tracklet ID if empty
      setValue(trackletId);
    }
  };

  const cancelEditing = () => {
    clearSelectedTracklet();
    setValue(alias || trackletId);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        className={`bg-background border rounded px-1 py-0 text-sm w-32 ${className}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span 
      className={`cursor-pointer ${isEditModeEnabled ? 'hover:bg-primary/10' : 'hover:underline'} ${className}`}
      onClick={handleClick}
      title={isEditModeEnabled ? "Click to edit (Edit mode is active)" : "Press 'Ctrl+E' to enable edit mode"}
    >
      {value}
    </span>
  );
};

export default EditableTrackletName;
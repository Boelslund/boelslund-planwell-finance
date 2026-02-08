import React from 'react';
import { useState, useRef, useEffect } from 'react';

export function useMenu(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      close();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        close();
      }
    };

    // Use setTimeout to defer adding the listener until after the current event
    // This prevents the click that opened the menu from immediately closing it
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return { isOpen, toggle, open, close, menuRef, handleKeyDown };
}

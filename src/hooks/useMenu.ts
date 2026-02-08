import React from 'react';
import { useState, useRef, useEffect } from 'react';

// TODO: KISS violation - useMenu has overly complex click-outside handling with setTimeout
// The setTimeout(0) workaround suggests a design issue. Consider using a more straightforward approach
// or documenting why the timeout is necessary
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

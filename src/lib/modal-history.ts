'use client';

import { useEffect, useRef } from 'react';

/**
 * Registers a modal or sub-view with the browser history stack.
 * When the modal opens, it pushes a history state.
 * When the user swipes back or presses the hardware/browser back button,
 * it automatically closes the modal instead of navigating away.
 */
export function useModalHistory(
  isOpen: boolean,
  onClose: () => void,
  modalName = 'modal'
) {
  const isPushedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Push history state if not already pushed
      if (!isPushedRef.current) {
        window.history.pushState({ modalOpen: true, modalName }, '');
        isPushedRef.current = true;
      }

      const handlePopState = (e: PopStateEvent) => {
        // If back was pressed and modal state was popped
        if (isPushedRef.current) {
          isPushedRef.current = false;
          onClose();
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        // If closed programmatically by clicking X, pop the history state to keep history clean
        if (isPushedRef.current) {
          isPushedRef.current = false;
          if (window.history.state?.modalOpen) {
            window.history.back();
          }
        }
      };
    } else {
      isPushedRef.current = false;
    }
  }, [isOpen, onClose, modalName]);
}

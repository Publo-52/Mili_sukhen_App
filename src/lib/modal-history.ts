'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Registers a modal or sub-view with the browser history stack.
 * When the modal opens, it pushes a history state.
 * When the user swipes back or presses the hardware/browser back button,
 * it automatically closes the modal instead of navigating away.
 *
 * Fix: onClose is stored in a stable ref so that internal navigation
 * (e.g. photo viewer arrow clicks that update parent state) does NOT
 * accidentally re-run the cleanup and call history.back().
 */
export function useModalHistory(
  isOpen: boolean,
  onClose: () => void,
  modalName = 'modal'
) {
  const isPushedRef = useRef(false);
  // Keep a stable ref to onClose — prevents effect re-runs on callback identity changes
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Stable popstate handler so we can add/remove the same function reference
  const handlePopState = useCallback(() => {
    if (isPushedRef.current) {
      isPushedRef.current = false;
      onCloseRef.current();
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      isPushedRef.current = false;
      return;
    }

    // Push a history entry when modal first opens
    if (!isPushedRef.current) {
      window.history.pushState({ modalOpen: true, modalName }, '');
      isPushedRef.current = true;
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
    // NOTE: intentionally omit onClose from deps — it lives in a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, modalName, handlePopState]);

  // Separate effect: clean up history entry when modal is closed programmatically (X button)
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    // Transition: open → closed (programmatic close, not popstate)
    if (wasOpen && !isOpen && isPushedRef.current) {
      isPushedRef.current = false;
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    }
  }, [isOpen]);
}

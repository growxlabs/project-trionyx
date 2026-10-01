'use client';

import { useEffect, useRef } from 'react';
import type { SerialInputSource } from './types';

export interface UseBarcodeScannerOptions {
  onScan: (serial: string, source: SerialInputSource) => void;
  enabled?: boolean;
  minChars?: number;
  maxIntervalMs?: number;
  targetInputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
}

/**
 * Headless hook to capture USB and Bluetooth barcode/QR scanners operating in HID Keyboard Wedge mode.
 *
 * Scanners send rapid keystrokes followed by an Enter or Tab terminator.
 * This hook listens cleanly while the serial workflow is active, supports continuous scanning without
 * re-clicking, and prevents hijacking unrelated inputs.
 */
export function useBarcodeScanner({
  onScan,
  enabled = true,
  minChars = 3,
  maxIntervalMs = 65,
  targetInputRef,
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef<{ char: string; time: number }[]>([]);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.isComposing) return;

      const key = event.key;
      const now = performance.now();

      // Check if user is typing in an unrelated form field (e.g. batch notes or description)
      const activeEl = document.activeElement;
      const isTargetInput = targetInputRef?.current && activeEl === targetInputRef.current;
      const isOtherInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') &&
        !isTargetInput;

      // Handle Enter / Tab terminator from scanner
      if (key === 'Enter' || key === 'Tab') {
        const buffer = bufferRef.current;
        bufferRef.current = [];

        // Scenario 1: Focus is directly in the dedicated serial input
        if (isTargetInput && targetInputRef.current) {
          const val = targetInputRef.current.value.trim();
          if (val.length >= minChars) {
            event.preventDefault();
            event.stopPropagation();
            onScanRef.current(val, 'USB_SCANNER');
            return;
          }
        }

        // Scenario 2: Global capture while modal/workflow is active
        if (buffer.length >= minChars) {
          // Calculate average inter-key time
          let totalInterval = 0;
          for (let i = 1; i < buffer.length; i++) {
            totalInterval += buffer[i].time - buffer[i - 1].time;
          }
          const avgInterval = totalInterval / (buffer.length - 1);

          // If user was in an unrelated input, only intercept if it was clearly a high-speed scanner burst (< 50ms)
          if (isOtherInput && avgInterval > 50) {
            return;
          }

          const scannedCode = buffer.map((b) => b.char).join('').trim();
          if (scannedCode.length >= minChars) {
            event.preventDefault();
            event.stopPropagation();
            onScanRef.current(scannedCode, 'USB_SCANNER');
          }
        }
        return;
      }

      // Only accumulate printable single characters without modifier keys
      if (key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        const buffer = bufferRef.current;
        const lastEntry = buffer[buffer.length - 1];

        // If too much time elapsed since last character, reset buffer for new scan
        if (lastEntry && now - lastEntry.time > maxIntervalMs) {
          bufferRef.current = [{ char: key, time: now }];
        } else {
          buffer.push({ char: key, time: now });
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      bufferRef.current = [];
    };
  }, [enabled, minChars, maxIntervalMs, targetInputRef]);
}

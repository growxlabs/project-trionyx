'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { CameraScannerMode, SerialInputSource } from './types';
import { playScanSound } from './feedback';

export interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (serial: string, source: SerialInputSource) => void;
  mode?: CameraScannerMode;
  title?: string;
  subtitle?: string;
}

export function CameraScannerModal({
  isOpen,
  onClose,
  onScan,
  mode = 'single',
  title = 'Scan Barcode / QR Code',
  subtitle,
}: CameraScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isScanningRef = useRef(false);
  const lastScannedCodeRef = useRef<{ code: string; time: number } | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const zxingControlsRef = useRef<any>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [lastDetected, setLastDetected] = useState<string | null>(null);
  const [scannedCount, setScannedCount] = useState(0);

  // Stop camera stream cleanly and release hardware
  const stopCamera = useCallback(() => {
    isScanningRef.current = false;

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (zxingControlsRef.current) {
      try {
        zxingControlsRef.current.stop();
      } catch {
        // Ignore
      }
      zxingControlsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore
        }
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsTorchOn(false);
    setIsTorchSupported(false);
  }, []);

  // Handle detected barcode with debouncing cooldown
  const handleBarcodeDetected = useCallback(
    (rawCode: string) => {
      const code = rawCode.trim().toUpperCase();
      if (!code) return;

      const now = performance.now();
      const last = lastScannedCodeRef.current;

      // In continuous mode, prevent re-reading the exact same code within 1.4s
      if (last && last.code === code && now - last.time < 1400) {
        return;
      }

      lastScannedCodeRef.current = { code, time: now };
      setLastDetected(code);
      setScannedCount((prev) => prev + 1);
      playScanSound('success');
      onScan(code, 'CAMERA');

      if (mode === 'single') {
        stopCamera();
        onClose();
      }
    },
    [mode, onScan, onClose, stopCamera]
  );

  // Toggle Torch if device hardware supports it
  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setIsTorchOn(nextState);
    } catch {
      setIsTorchSupported(false);
    }
  };

  // Start video stream & scanner loop
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setLastDetected(null);
      setScannedCount(0);
      setErrorMessage(null);
      return;
    }

    let isMounted = true;

    async function initCamera() {
      try {
        setErrorMessage(null);
        setHasPermission(null);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported on this browser or connection.');
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setHasPermission(true);

        // Check torch capability
        const track = stream.getVideoTracks()[0];
        if (track && typeof track.getCapabilities === 'function') {
          const caps = track.getCapabilities() as any;
          if (caps && caps.torch) {
            setIsTorchSupported(true);
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          isScanningRef.current = true;

          // Strategy 1: Check for native BarcodeDetector API (High-performance hardware accelerated)
          if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
            try {
              const supportedFormats = await (window as any).BarcodeDetector.getSupportedFormats();
              const formats = [
                'code_128',
                'code_39',
                'qr_code',
                'data_matrix',
                'ean_13',
                'upc_a',
              ].filter((f) => supportedFormats.includes(f));

              const barcodeDetector = new (window as any).BarcodeDetector({ formats });

              const detectFrame = async () => {
                if (!isScanningRef.current || !videoRef.current) return;

                if (videoRef.current.readyState >= 2) {
                  try {
                    const barcodes = await barcodeDetector.detect(videoRef.current);
                    if (barcodes && barcodes.length > 0) {
                      const detected = barcodes[0].rawValue;
                      if (detected) {
                        handleBarcodeDetected(detected);
                      }
                    }
                  } catch {
                    // Frame detection skip
                  }
                }

                if (isScanningRef.current) {
                  animFrameIdRef.current = requestAnimationFrame(detectFrame);
                }
              };

              animFrameIdRef.current = requestAnimationFrame(detectFrame);
              return;
            } catch {
              // Fallback to ZXing if native initialization failed
            }
          }

          // Strategy 2: Fallback to @zxing/browser
          try {
            const { BrowserMultiFormatReader } = await import('@zxing/browser');
            const codeReader = new BrowserMultiFormatReader();
            zxingControlsRef.current = await codeReader.decodeFromVideoElement(
              videoRef.current,
              (result, error) => {
                if (result && isScanningRef.current) {
                  handleBarcodeDetected(result.getText());
                }
              }
            );
          } catch (zxingErr: any) {
            if (isMounted) {
              setErrorMessage('Barcode scanner engine failed to start.');
            }
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        setHasPermission(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage('Camera access was denied. Please allow camera permissions in your browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setErrorMessage('No camera device was detected on your hardware.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setErrorMessage('Camera is currently in use by another application.');
        } else {
          setErrorMessage(err.message || 'Unable to access camera.');
        }
      }
    }

    void initCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen, handleBarcodeDetected, stopCamera]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-scanner-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#171714] text-[#FCFBF7] rounded-xl border border-[rgba(255,255,255,0.12)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#1F1F1C]">
          <div>
            <h2 id="camera-scanner-title" className="text-[14px] font-semibold text-white m-0">
              {title}
            </h2>
            <p className="text-[12px] text-[rgba(255,255,255,0.6)] m-0 mt-0.5">
              {subtitle || (mode === 'continuous' ? 'Scan multiple serial units. Tap Done when finished.' : 'Align barcode or QR code within the frame.')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="w-8 h-8 rounded-md flex items-center justify-center text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Video Viewfinder Area */}
        <div className="relative w-full aspect-4/3 bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover"
          />

          {/* Viewfinder Target Reticle */}
          {hasPermission && !errorMessage && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-64 h-44 sm:w-72 sm:h-48 border-2 border-[#F26522]/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                {/* Corner Accents */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-[#F26522]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-[#F26522]" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-[#F26522]" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-[#F26522]" />

                {/* Laser scan line indicator */}
                <div className="absolute left-2 right-2 h-0.5 bg-[#F26522] top-1/2 -translate-y-1/2 opacity-75 shadow-[0_0_8px_#F26522]" />
              </div>
            </div>
          )}

          {/* Status Overlay / Toast in Continuous Mode */}
          {lastDetected && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1.5 rounded-full bg-[#15803D]/90 text-white text-[12px] font-mono font-semibold flex items-center gap-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Captured: {lastDetected}</span>
            </div>
          )}

          {/* Permission / Error Presentation */}
          {errorMessage && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#171714]">
              <div className="w-12 h-12 rounded-full bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-[15px] font-semibold text-white m-0 mb-1">Camera Unavailable</h3>
              <p className="text-[13px] text-[rgba(255,255,255,0.7)] max-w-xs m-0">
                {errorMessage}
              </p>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-4 py-3 bg-[#1F1F1C] border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isTorchSupported && (
              <button
                type="button"
                onClick={handleToggleTorch}
                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isTorchOn
                    ? 'bg-[#F26522] text-white'
                    : 'bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.15)]'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>{isTorchOn ? 'Torch On' : 'Torch'}</span>
              </button>
            )}

            {mode === 'continuous' && (
              <span className="text-[12px] font-mono text-[rgba(255,255,255,0.7)]">
                {scannedCount} captured this session
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-white hover:bg-[rgba(255,255,255,0.9)] text-[#171714] text-[13px] font-semibold transition-colors cursor-pointer"
          >
            {mode === 'continuous' ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

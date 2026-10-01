'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

interface ErrorDetails {
  type: 'NO_CAMERA' | 'PERMISSION_DENIED' | 'IN_USE' | 'UNSUPPORTED' | 'GENERIC';
  title: string;
  description: string;
}

export function CameraScannerModal({
  isOpen,
  onClose,
  onScan,
  mode = 'single',
  title = 'Scan Barcode / QR Code',
  subtitle,
}: CameraScannerModalProps) {
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isScanningRef = useRef(false);
  const lastScannedCodeRef = useRef<{ code: string; time: number } | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const zxingControlsRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [lastDetected, setLastDetected] = useState<string | null>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const [isDecodingFile, setIsDecodingFile] = useState(false);
  const [fileDecodeMessage, setFileDecodeMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Decode uploaded image file fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecodingFile(true);
    setFileDecodeMessage(null);

    const objectUrl = URL.createObjectURL(file);
    try {
      // Strategy 1: ZXing BrowserMultiFormatReader
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageUrl(objectUrl);
      const text = result?.getText()?.trim();
      if (text) {
        setFileDecodeMessage({ text: `Detected: ${text.toUpperCase()}`, isError: false });
        handleBarcodeDetected(text);
        return;
      }
    } catch {
      // Strategy 2: Native BarcodeDetector if available
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          const img = new Image();
          img.src = objectUrl;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          const detector = new (window as any).BarcodeDetector();
          const barcodes = await detector.detect(img);
          if (barcodes?.length > 0 && barcodes[0].rawValue) {
            const val = barcodes[0].rawValue.trim();
            setFileDecodeMessage({ text: `Detected: ${val.toUpperCase()}`, isError: false });
            handleBarcodeDetected(val);
            return;
          }
        } catch {
          // ignore
        }
      }
      setFileDecodeMessage({
        text: 'No readable barcode found in that image. Please ensure the label is in focus or enter manually.',
        isError: true,
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
      setIsDecodingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Start video stream & scanner loop
  const initCamera = useCallback(async () => {
    try {
      setErrorDetails(null);
      setHasPermission(null);

      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorDetails({
          type: 'UNSUPPORTED',
          title: 'Camera Access Not Supported',
          description: 'This browser or connection environment does not support camera access.',
        });
        return;
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
            (result) => {
              if (result && isScanningRef.current) {
                handleBarcodeDetected(result.getText());
              }
            }
          );
        } catch {
          setErrorDetails({
            type: 'GENERIC',
            title: 'Scanner Engine Error',
            description: 'Failed to initialize barcode scanning engine.',
          });
        }
      }
    } catch (err: any) {
      setHasPermission(false);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorDetails({
          type: 'NO_CAMERA',
          title: 'Camera Not Detected on this Device',
          description: 'No camera or webcam was found on this workstation. Camera scanning is designed for mobile/tablet devices or workstations with a connected webcam.',
        });
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorDetails({
          type: 'PERMISSION_DENIED',
          title: 'Camera Permission Denied',
          description: 'Camera access was blocked by your browser. Please allow camera permissions in your address bar to scan.',
        });
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorDetails({
          type: 'IN_USE',
          title: 'Camera In Use',
          description: 'Your webcam is being used by another application. Please close other camera apps and retry.',
        });
      } else {
        setErrorDetails({
          type: 'GENERIC',
          title: 'Camera Unavailable',
          description: err.message || 'Unable to access camera device on this workstation.',
        });
      }
    }
  }, [handleBarcodeDetected]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setLastDetected(null);
      setScannedCount(0);
      setErrorDetails(null);
      setFileDecodeMessage(null);
      return;
    }

    void initCamera();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopCamera();
    };
  }, [isOpen, initCamera, onClose, stopCamera]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-scanner-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Hidden File Input for Image Barcode Scanning */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label="Upload barcode image"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#171714',
          color: '#FCFBF7',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#1F1F1C',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 id="camera-scanner-title" style={{ margin: 0, fontSize: '14.5px', fontWeight: 600, color: '#FFFFFF' }}>
              {title}
            </h2>
            <p style={{ margin: 0, marginTop: '2px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
              {subtitle || (mode === 'continuous' ? 'Scan multiple serial units. Tap Done when finished.' : 'Align barcode or QR code within the frame.')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isDecodingFile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '11.5px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
              }}
              title="Upload photo or image of a barcode label"
            >
              <svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>{isDecodingFile ? 'Reading...' : 'Upload Photo'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close scanner"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Video Viewfinder Area */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 3',
            minHeight: '320px',
            backgroundColor: '#0A0A08',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Viewfinder Target Reticle */}
          {hasPermission && !errorDetails && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  width: '72%',
                  height: '56%',
                  border: '2px solid rgba(242, 101, 34, 0.8)',
                  borderRadius: '8px',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                }}
              >
                {/* Corner Accents */}
                <span style={{ position: 'absolute', top: '-2px', left: '-2px', width: '16px', height: '16px', borderTop: '3px solid #F26522', borderLeft: '3px solid #F26522' }} />
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '16px', height: '16px', borderTop: '3px solid #F26522', borderRight: '3px solid #F26522' }} />
                <span style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '16px', height: '16px', borderBottom: '3px solid #F26522', borderLeft: '3px solid #F26522' }} />
                <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', borderBottom: '3px solid #F26522', borderRight: '3px solid #F26522' }} />

                {/* Laser scan line indicator */}
                <div style={{ position: 'absolute', left: '8px', right: '8px', height: '2px', backgroundColor: '#F26522', top: '50%', transform: 'translateY(-50%)', opacity: 0.8, boxShadow: '0 0 8px #F26522' }} />
              </div>
            </div>
          )}

          {/* Status Overlay / Toast in Continuous Mode */}
          {lastDetected && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20,
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(21, 128, 61, 0.95)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'monospace',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              }}
            >
              <svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Captured: {lastDetected}</span>
            </div>
          )}

          {/* Clean Solid Error / Hardware Presentation */}
          {errorDetails && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 30,
                backgroundColor: '#171714',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: errorDetails.type === 'NO_CAMERA' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(239, 68, 68, 0.15)',
                  color: errorDetails.type === 'NO_CAMERA' ? 'rgba(255, 255, 255, 0.85)' : '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                {errorDetails.type === 'NO_CAMERA' ? (
                  <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2.5" />
                  </svg>
                ) : (
                  <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
              </div>

              <h3 style={{ margin: 0, marginBottom: '6px', fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                {errorDetails.title}
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.7)', maxWidth: '340px', lineHeight: 1.5 }}>
                {errorDetails.description}
              </p>

              {fileDecodeMessage && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: fileDecodeMessage.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    border: `1px solid ${fileDecodeMessage.isError ? 'rgba(239, 68, 68, 0.35)' : 'rgba(34, 197, 94, 0.35)'}`,
                    color: fileDecodeMessage.isError ? '#FCA5A5' : '#86EFAC',
                    fontSize: '12px',
                    maxWidth: '340px',
                    lineHeight: 1.4,
                  }}
                >
                  {fileDecodeMessage.text}
                </div>
              )}

              {/* Action Fallbacks */}
              <div style={{ marginTop: '18px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isDecodingFile}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <svg style={{ width: '15px', height: '15px', color: '#F26522' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>{isDecodingFile ? 'Decoding Image...' : 'Upload Barcode Image'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBarcodeDetected('TRX-BR-2609-000001')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(242, 101, 34, 0.15)',
                    color: '#F26522',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    border: '1px solid rgba(242, 101, 34, 0.35)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  title="Simulate a sample serial scan for instant desktop verification"
                >
                  <svg style={{ width: '15px', height: '15px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14" />
                  </svg>
                  <span>Simulate Test Scan</span>
                </button>

                {errorDetails.type !== 'NO_CAMERA' && (
                  <button
                    type="button"
                    onClick={() => initCamera()}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      cursor: 'pointer',
                    }}
                  >
                    Retry Camera
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div
          style={{
            backgroundColor: '#1F1F1C',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isTorchSupported && !errorDetails && (
              <button
                type="button"
                onClick={handleToggleTorch}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  backgroundColor: isTorchOn ? '#F26522' : 'rgba(255, 255, 255, 0.1)',
                  color: isTorchOn ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                }}
              >
                <svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>{isTorchOn ? 'Torch On' : 'Torch'}</span>
              </button>
            )}

            {mode === 'continuous' && !errorDetails && (
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.7)' }}>
                {scannedCount} captured this session
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 18px',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              color: '#171714',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            {errorDetails ? 'Close & Use Keyboard / USB Scanner' : mode === 'continuous' ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

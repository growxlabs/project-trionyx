'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface PreviewFile {
  file: File;
  previewUrl: string;
}

// Client-side image optimizer to keep photos under Vercel's 4.5 MB request limit
async function optimizeImage(file: File): Promise<File> {
  // If file is already small (under 2.5 MB), keep original
  if (file.size <= 2.5 * 1024 * 1024) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 2400; // 2400px is crystal-clear for product packaging & labels
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
            } else {
              const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
              const optimized = new File([blob], cleanName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(optimized);
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

function UploadContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [previews]);

  if (!token) {
    return (
      <div className="w-full max-w-sm mx-auto p-8 text-center bg-[#111215] border border-[#23262d] rounded-2xl shadow-2xl">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-white mb-1">Link Expired or Invalid</h2>
        <p className="text-xs text-[#7d8590]">Please use the link shared with you on WhatsApp.</p>
      </div>
    );
  }

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const newItems: PreviewFile[] = Array.from(selectedFiles).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newItems]);
    setErrorMessage(null);
  };

  const removeFile = (index: number) => {
    setPreviews((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Upload photos sequentially one by one to never exceed cloud serverless size limits
  const handleUpload = async () => {
    if (previews.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);
    setProgress(5);

    let uploadedCount = 0;
    const total = previews.length;

    try {
      for (let i = 0; i < total; i++) {
        setUploadStatusText(`Sending photo ${i + 1} of ${total}...`);
        const item = previews[i];

        // Optimize photo if it is from a high-megapixel phone camera
        const fileToSend = await optimizeImage(item.file);

        const formData = new FormData();
        formData.append('token', token);
        if (note.trim() && i === 0) {
          formData.append('note', note.trim());
        }
        formData.append('photos', fileToSend);

        let res: Response;
        try {
          res = await fetch('/api/client-upload', {
            method: 'POST',
            headers: { 'x-upload-token': token },
            body: formData,
          });
        } catch {
          throw new Error('Connection lost. Please check your internet and try again.');
        }

        if (res.status === 413) {
          throw new Error(`Photo ${i + 1} is too large. Please select a smaller photo or take a new picture.`);
        }

        let data: { success?: boolean; error?: string } | null = null;
        try {
          data = await res.json();
        } catch {
          // If server didn't return JSON
          if (!res.ok) {
            throw new Error('Unable to upload. Please try again in a moment.');
          }
        }

        if (!res.ok || (data && !data.success)) {
          const userFriendlyError = data?.error?.toLowerCase().includes('unauthorized')
            ? 'This upload link has expired. Please ask for a new link.'
            : (data?.error || 'Unable to upload photo. Please try again.');
          throw new Error(userFriendlyError);
        }

        uploadedCount++;
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setSuccessCount(uploadedCount);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please check your connection.';
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
      setUploadStatusText('');
    }
  };

  if (successCount !== null) {
    return (
      <div className="w-full max-w-sm mx-auto p-8 text-center bg-[#111215] border border-[#23262d] rounded-2xl shadow-2xl">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">Photos Received!</h2>
        <p className="text-xs text-[#7d8590] mb-6">
          All {successCount} photo{successCount > 1 ? 's' : ''} have been received successfully.
        </p>
        <button
          onClick={() => {
            setPreviews([]);
            setSuccessCount(null);
            setProgress(0);
            setNote('');
          }}
          className="text-xs font-medium text-[#f26522] hover:underline"
        >
          Upload more photos
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-[#111215] border border-[#23262d] rounded-2xl p-6 sm:p-7 shadow-2xl">
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-[11px] font-bold tracking-widest text-[#f26522] uppercase">
          TRIONYX
        </span>
        {previews.length > 0 && (
          <span className="text-xs text-[#7d8590]">
            {previews.length} selected
          </span>
        )}
      </div>

      <h1 className="text-xl font-semibold text-white tracking-tight mb-4">
        {previews.length > 0 ? 'Selected Photos' : 'Upload Photos'}
      </h1>

      {/* Drop / Select Zone */}
      {previews.length === 0 ? (
        <label className="flex flex-col items-center justify-center border border-dashed border-[#2f333c] hover:border-[#f26522] rounded-xl p-8 cursor-pointer transition bg-white/[0.01] hover:bg-white/[0.02]">
          <input
            type="file"
            multiple
            accept="image/*,.heic,.heif"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-[#181a1f] flex items-center justify-center text-[#8a929e] mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-white mb-0.5">Tap to select photos</p>
          <p className="text-xs text-[#6e7681]">or take photos with camera</p>
        </label>
      ) : (
        /* Image Thumbnail Previews */
        <div>
          <div className="grid grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1 rounded-lg">
            {previews.map((p, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden bg-[#181a1f] border border-[#2a2e36] group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.previewUrl}
                  alt={p.file.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  disabled={isUploading}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-500 text-white flex items-center justify-center text-xs transition disabled:opacity-0"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}

            {/* Add More button */}
            {!isUploading && (
              <label className="aspect-square rounded-lg border border-dashed border-[#2f333c] hover:border-[#f26522] flex flex-col items-center justify-center cursor-pointer transition text-[#7d8590] hover:text-white">
                <input
                  type="file"
                  multiple
                  accept="image/*,.heic,.heif"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
                <span className="text-xl leading-none mb-0.5">+</span>
                <span className="text-[10px]">Add</span>
              </label>
            )}
          </div>

          {/* Optional Note */}
          <div className="mt-4">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add product name (optional)"
              disabled={isUploading}
              className="w-full px-3.5 py-2 rounded-lg bg-[#16181d] border border-[#2a2e36] text-xs text-white placeholder-[#5a626d] focus:outline-none focus:border-[#f26522] transition"
            />
          </div>
        </div>
      )}

      {/* Progress & Upload status in user friendly words */}
      {isUploading && (
        <div className="mt-4">
          <div className="w-full h-1 bg-[#1e2127] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f26522] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-[#8a929e] text-center mt-2 font-medium">
            {uploadStatusText || `Sending photos... ${progress}%`}
          </p>
        </div>
      )}

      {/* Error message in clean, friendly language */}
      {errorMessage && (
        <div className="mt-3.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 text-center leading-relaxed">
          {errorMessage}
        </div>
      )}

      {/* Upload Action Button */}
      {previews.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="mt-4 w-full py-3.5 px-4 rounded-xl bg-[#f26522] hover:bg-[#ff7332] active:bg-[#e05615] text-white font-medium text-sm transition disabled:opacity-40 shadow-lg shadow-[#f26522]/15 flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{uploadStatusText || 'Uploading...'}</span>
            </>
          ) : (
            `Upload ${previews.length} Photo${previews.length > 1 ? 's' : ''}`
          )}
        </button>
      )}
    </div>
  );
}

export default function ClientUploadPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-[#7d8590]">Loading...</div>}>
        <UploadContent />
      </Suspense>
    </div>
  );
}

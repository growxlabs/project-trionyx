'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface PreviewFile {
  file: File;
  previewUrl: string;
}

function UploadContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  // Clean up object URLs on unmount or file clear
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
        <h2 className="text-base font-semibold text-white mb-1">Invalid Link</h2>
        <p className="text-xs text-[#7d8590]">Please use the link shared on WhatsApp.</p>
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

  const handleUpload = async () => {
    if (previews.length === 0) return;

    setIsUploading(true);
    setProgress(15);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('token', token);
      if (note.trim()) formData.append('note', note.trim());
      previews.forEach((p) => formData.append('photos', p.file));

      const timer = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 250);

      const res = await fetch('/api/client-upload', {
        method: 'POST',
        headers: { 'x-upload-token': token },
        body: formData,
      });

      clearInterval(timer);
      setProgress(100);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccessCount(data.count);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
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
        <h2 className="text-lg font-semibold text-white mb-1">Photos Received</h2>
        <p className="text-xs text-[#7d8590] mb-6">
          {successCount} photo{successCount > 1 ? 's' : ''} uploaded successfully.
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
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-500 text-white flex items-center justify-center text-xs transition"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}

            {/* Add More button */}
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
          </div>

          {/* Optional Note */}
          <div className="mt-4">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add note (optional)"
              disabled={isUploading}
              className="w-full px-3.5 py-2 rounded-lg bg-[#16181d] border border-[#2a2e36] text-xs text-white placeholder-[#5a626d] focus:outline-none focus:border-[#f26522] transition"
            />
          </div>
        </div>
      )}

      {/* Progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="w-full h-1 bg-[#1e2127] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f26522] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-[#7d8590] text-center mt-1.5">Uploading... {progress}%</p>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <p className="text-xs text-red-400 text-center mt-3 bg-red-500/10 py-1.5 px-3 rounded-md">
          {errorMessage}
        </p>
      )}

      {/* Upload Action Button */}
      {previews.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="mt-4 w-full py-3 px-4 rounded-xl bg-[#f26522] hover:bg-[#ff7332] active:bg-[#e05615] text-white font-medium text-sm transition disabled:opacity-40 shadow-lg shadow-[#f26522]/15"
        >
          {isUploading ? 'Uploading...' : `Upload ${previews.length} Photo${previews.length > 1 ? 's' : ''}`}
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

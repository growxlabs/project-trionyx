'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ClientUploadForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!token) {
    return (
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#151719] border border-red-500/30 text-center shadow-2xl">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Access Restricted</h2>
        <p className="text-sm text-[#8a9096] mb-6">
          This upload session requires a valid authorization link. Please check the link shared with you or contact the Trionyx team.
        </p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setErrorMessage(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setProgress(10);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('token', token);
      if (note.trim()) formData.append('note', note.trim());
      files.forEach((file) => formData.append('photos', file));

      // Simulate initial progress step
      const progressTimer = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 300);

      const res = await fetch('/api/client-upload', {
        method: 'POST',
        headers: {
          'x-upload-token': token,
        },
        body: formData,
      });

      clearInterval(progressTimer);
      setProgress(100);

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed. Please try again.');
      }

      setSuccessCount(data.count);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (successCount !== null) {
    return (
      <div className="w-full max-w-lg p-8 rounded-2xl bg-[#151719] border border-emerald-500/30 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Upload Complete!</h2>
        <p className="text-sm text-[#8a9096] mb-6">
          <strong className="text-white">{successCount} photo(s)</strong> have been securely uploaded in full resolution to our production cloud.
        </p>
        <button
          onClick={() => {
            setFiles([]);
            setSuccessCount(null);
            setProgress(0);
            setNote('');
          }}
          className="px-5 py-2.5 rounded-lg border border-[#2a2e33] text-sm text-[#c8ccd0] hover:text-white hover:bg-[#1f2327] transition"
        >
          Upload More Photos
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-[#151719] border border-[#262a2e] shadow-2xl">
      <div className="text-center mb-6">
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#f26522] mb-1.5 block">
          Trionyx Secure Media
        </span>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Upload Product Photos</h1>
        <p className="text-sm text-[#8a9096] mt-1.5">
          Select or take product photos in original quality. Files are transferred directly to cloud storage.
        </p>
      </div>

      <div className="relative border-2 border-dashed border-[#2f353b] hover:border-[#f26522] rounded-xl p-6 sm:p-8 text-center transition cursor-pointer bg-white/[0.01]">
        <input
          type="file"
          id="photoInput"
          multiple
          accept="image/*,.heic,.heif"
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
        />
        <svg
          className="w-12 h-12 mx-auto mb-3 text-[#6a727a] stroke-[1.5]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm font-medium text-white mb-1">
          {files.length > 0 ? `${files.length} photo(s) selected` : 'Tap to take photos or choose files'}
        </p>
        <p className="text-xs text-[#8a9096]">JPEG, PNG, WebP, HEIC · Max 25 MB each</p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 max-h-40 overflow-y-auto divide-y divide-[#22262a] rounded-lg bg-[#111315] border border-[#22262a]">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
              <span className="text-[#d0d4d8] truncate max-w-[280px]">{f.name}</span>
              <span className="text-[#6d747c] ml-2 flex-shrink-0">
                {(f.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional: Product name or studio note (e.g. Borophene 50ml)"
          disabled={isUploading}
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#111315] border border-[#2a2e33] text-sm text-white placeholder-[#5a626a] focus:outline-none focus:border-[#f26522] transition"
        />
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="w-full h-1.5 bg-[#202428] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f26522] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center text-[#8a9096] mt-2">Uploading to cloud storage... {progress}%</p>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
          {errorMessage}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={files.length === 0 || isUploading}
        className="mt-6 w-full py-3.5 px-4 rounded-lg bg-[#f26522] hover:bg-[#ff7332] active:bg-[#e05615] text-white font-medium text-sm transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#f26522]/20"
      >
        {isUploading
          ? 'Uploading...'
          : files.length > 0
          ? `Upload ${files.length} Photo${files.length > 1 ? 's' : ''}`
          : 'Select Photos to Upload'}
      </button>
    </div>
  );
}

export default function ClientUploadPage() {
  return (
    <div className="min-h-screen bg-[#0c0d0e] flex flex-col items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-sm text-[#8a9096] animate-pulse">Initializing upload session...</div>
        }
      >
        <ClientUploadForm />
      </Suspense>
    </div>
  );
}

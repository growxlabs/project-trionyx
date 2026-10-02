import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ActivateForm } from './ActivateForm';

export const metadata: Metadata = {
  title: 'Activate Dealer Account — Trionyx',
  description: 'Set your password and activate your Trionyx Dealer Portal access',
};

export default function ActivatePage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-[440px] bg-[#FFFFFF] border border-[#171717]/10 rounded-lg p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-10 h-10 rounded bg-[#171717] text-white font-bold text-base items-center justify-center mb-3">
            TRX
          </div>
          <span className="block text-[11px] font-bold tracking-[0.16em] text-[#737373]">
            TRIONYX AUTOMOTIVE
          </span>
          <h1 className="text-[22px] font-bold text-[#171717] mt-1 tracking-tight">
            Activate Dealer Access
          </h1>
          <p className="text-[13px] text-[#737373] mt-1.5">
            Welcome to the partner network. Choose a secure password to activate your access.
          </p>
        </div>

        {/* Form wrapped in Suspense for search params */}
        <Suspense fallback={<div className="text-center text-sm text-[#737373]">Loading activation token...</div>}>
          <ActivateForm />
        </Suspense>
      </div>
    </div>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Distributor Login — Trionyx Operations',
  description: 'Sign in to the Trionyx Distributor Workspace.',
};

export default function LoginPage() {
  const contactUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/contact`
    : 'http://localhost:3000/contact';

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-[420px] bg-[#FFFFFF] border border-[#E0E0E0] rounded-lg p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/brand/trionyx-logo-dark.png"
            alt="Trionyx"
            width={2092}
            height={752}
            priority
            className="mx-auto mb-5 h-14 w-auto object-contain"
          />
          <h1 className="text-[22px] font-bold text-[#171717] tracking-tight">
            Distributor Login
          </h1>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-6 text-center text-[12.5px] text-[#737373]">
          Need access?{' '}
          <a
            href={contactUrl}
            className="font-medium text-[#171717] hover:text-[#F26522] transition-colors underline underline-offset-2"
          >
            Contact Trionyx
          </a>
          .
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Dealer Sign In — Trionyx',
  description: 'Sign in to your Trionyx dealer account.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F5EE] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-[420px] bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-8 shadow-[0_4px_24px_rgba(23,23,20,0.04)]">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/brand/trionyx-logo-dark.png"
            alt="Trionyx"
            width={2092}
            height={752}
            priority
            className="mx-auto mb-4 h-14 w-auto object-contain"
          />
          <h1 className="text-[22px] font-bold text-[#171714] mt-1 tracking-tight">
            Dealer sign in
          </h1>
          <p className="text-[13px] text-[#68665F] mt-1.5">
            View products, check availability, and manage your requests.
          </p>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#171714]/08 text-center text-[12px] text-[#68665F]">
          <p>Need a dealer account?</p>
          <p className="mt-1 text-[#171714] font-medium">Contact your Trionyx distributor.</p>
        </div>
      </div>
    </div>
  );
}

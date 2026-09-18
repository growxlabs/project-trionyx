'use client';

import React from 'react';
import { SectionFrame } from '../frame';
import ClientFeedback from '../ui/testimonial';

export const ReviewsSection: React.FC = () => {
  return (
    <SectionFrame
      id="reviews"
      hasBottomBorder
      className="bg-[#F7F6F0] overflow-hidden"
    >
      <ClientFeedback />
    </SectionFrame>
  );
};

'use client';

import React from 'react';
import { SectionFrame } from '../frame';
import ClientFeedback from '../ui/testimonial';

export const ReviewsSection: React.FC = () => {
  return (
    <SectionFrame
      id="reviews"
      hasBottomBorder
      className="bg-[#F5F5EE] overflow-hidden"
    >
      <ClientFeedback />
    </SectionFrame>
  );
};

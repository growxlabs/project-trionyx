import React from 'react';
import { Button } from '@trionyx/ui';
import { rawColors } from '@trionyx/design-tokens';

export default function DealerPortalHome() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '440px', width: '100%', background: '#FCFBF7', border: '1px solid rgba(23,23,20,0.08)', borderRadius: '8px', padding: '36px', boxShadow: '0 4px 20px rgba(23,23,20,0.04)' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: rawColors.secondaryText, display: 'block', marginBottom: '8px' }}>
          TRIONYX AUTOMOTIVE
        </span>
        <h1 style={{ fontSize: '26px', fontWeight: 600, color: rawColors.primaryText, margin: '0 0 12px 0', letterSpacing: '-0.025em' }}>
          Dealer Portal
        </h1>
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: rawColors.secondaryText, margin: '0 0 24px 0' }}>
          Authorized portal for certified detailing studios, verified applicators, and regional dealer operations.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary" size="md">
            Partner Sign In
          </Button>
          <Button variant="outline" size="md">
            Apply for Dealership
          </Button>
        </div>
      </div>
    </main>
  );
}

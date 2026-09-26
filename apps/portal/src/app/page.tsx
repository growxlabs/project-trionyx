import React from 'react';
import { Button } from '@trionyx/ui';

export default function OperationsPortalHome() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '440px', width: '100%', background: '#262622', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '36px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#F26522', display: 'block', marginBottom: '8px' }}>
          INTERNAL OPERATIONS
        </span>
        <h1 style={{ fontSize: '26px', fontWeight: 600, color: '#FCFBF7', margin: '0 0 12px 0', letterSpacing: '-0.025em' }}>
          Trionyx Portal
        </h1>
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#A2A096', margin: '0 0 24px 0' }}>
          Restricted management surface for regional distributors, executive directors, and administrative operations.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary" size="md">
            Sign In with Security Key
          </Button>
        </div>
      </div>
    </main>
  );
}

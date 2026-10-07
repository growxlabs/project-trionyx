'use client';

import React from 'react';
import type { ComponentProps } from 'react';
import { JSONUIProvider, Renderer } from '@json-render/react';
import { trixRegistry } from './trix-registry';
import { buildTrixSpec } from './trix-spec-builder';
import type { ResultResponse } from '../../app/trix/TrixResultCards';

export interface TrixJsonRendererProps {
  response?: ResultResponse;
  spec?: ComponentProps<typeof Renderer>['spec'];
}

export function TrixJsonRenderer({ response, spec }: TrixJsonRendererProps) {
  const finalSpec = spec ?? (response ? buildTrixSpec(response) : null);

  if (!finalSpec || !finalSpec.root) return null;

  return (
    <JSONUIProvider registry={trixRegistry}>
      <div className="trix-json-render-host w-full min-w-0 max-w-full box-border">
        <Renderer spec={finalSpec} registry={trixRegistry} />
      </div>
    </JSONUIProvider>
  );
}

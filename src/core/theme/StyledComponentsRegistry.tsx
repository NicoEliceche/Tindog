// src/core/theme/StyledComponentsRegistry.tsx
'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

// Registro oficial de styled-components v6 para Next.js App Router.
// Sin esto, el SSR y el CSR no comparten el mismo StyleSheet incremental,
// lo que puede producir hashes de className distintos entre servidor y
// cliente (hydration mismatch) en componentes con muchas props dinámicas.
// https://styled-components.com/docs/faqs#nextjs
export function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}

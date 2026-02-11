'use client';

import { useIsBentoShell } from '../hooks/useIsBentoShell';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useState, useEffect } from 'react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  // Initialize with false to match server render, or handle hydration carefully.
  // Ideally we'd use a comprehensive hook or useLayoutEffect, but for this assignment:
  const [isBentoShell, setIsBentoShell] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check UA once mounted on client
    if (window.navigator.userAgent.includes('BentoShell')) {
      setIsBentoShell(true);
    }
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch by rendering a generic structure initially or null
    // Here we render desktop view by default or hidden. Let's render children only to avoid flash of sidebar?
    // Actually, requirement implies desktop is default browser view.
    return <>{children}</>; 
  }

  if (isBentoShell) {
    return (
      <div style={{ paddingTop: 'var(--bento-safe-top, 0px)', minHeight: '100vh' }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '250px', width: '100%', paddingBottom: '60px' }}>
        <div style={{ padding: '20px' }}>
             {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}

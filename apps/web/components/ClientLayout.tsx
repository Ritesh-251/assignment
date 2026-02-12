'use client';

import { useIsBentoShell } from '../hooks/useIsBentoShell';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useState, useEffect } from 'react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  
  const [isBentoShell, setIsBentoShell] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (window.navigator.userAgent.includes('BentoShell')) {
      setIsBentoShell(true);
    }
  }, []);

  if (!mounted) {
    
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

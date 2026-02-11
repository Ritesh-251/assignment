'use client';

import { useState, useEffect } from 'react';

export function useIsBentoShell() {
  const [isBentoShell, setIsBentoShell] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('BentoShell')) {
      setIsBentoShell(true);
    }
  }, []);

  return isBentoShell;
}

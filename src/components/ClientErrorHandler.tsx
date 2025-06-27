'use client';

import { useEffect } from 'react';
import { initErrorHandler } from '@/lib/errorHandler';

export default function ClientErrorHandler() {
  useEffect(() => {
    initErrorHandler();
  }, []);

  return null;
} 
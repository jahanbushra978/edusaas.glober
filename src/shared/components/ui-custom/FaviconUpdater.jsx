'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';

/**
 * FaviconUpdater — Settings থেকে favicon_url পড়ে browser tab icon আপডেট করে।
 * এটা Providers-এ mount করা হয়েছে, তাই সব পেজে কাজ করবে।
 */
export default function FaviconUpdater() {
  const { data: settings = [] } = useQuery({
    queryKey: ['app-settings-public'],
    queryFn: () => appClient.entities.AppSettings.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (!Array.isArray(settings) || settings.length === 0) return;

    const faviconUrl = settings.find(s => s.key === 'favicon_url')?.value;
    if (!faviconUrl || !faviconUrl.startsWith('http')) return;

    // Remove existing favicon links
    const existingLinks = document.querySelectorAll("link[rel~='icon'], link[rel~='shortcut']");
    existingLinks.forEach(link => link.parentNode?.removeChild(link));

    // Insert new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = faviconUrl;
    document.head.appendChild(link);

    // Also add shortcut icon for older browsers
    const shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    shortcut.href = faviconUrl;
    document.head.appendChild(shortcut);
  }, [settings]);

  return null;
}

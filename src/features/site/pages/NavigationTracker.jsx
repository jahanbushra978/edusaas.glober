'use client'

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { appClient } from '@/api/appClient';
import { pagesConfig } from '@/pages.config';

export default function NavigationTracker() {
    const routePathname = usePathname() || '';
    const { isAuthenticated } = useAuth();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    // Log user activity when navigating to a page
    useEffect(() => {
        let pageName;

        if (routePathname === '/' || routePathname === '') {
            pageName = mainPageKey;
        } else {
            // Remove leading slash and get the first segment
            const pathSegment = routePathname.replace(/^\//, '').split('/')[0];

            // Try case-insensitive lookup in Pages config
            const pageKeys = Object.keys(Pages);
            const matchedKey = pageKeys.find(
                key => key.toLowerCase() === pathSegment.toLowerCase()
            );

            pageName = matchedKey || null;
        }

        if (isAuthenticated && pageName) {
            if (appClient.appLogs?.logUserInApp) {
                appClient.appLogs.logUserInApp(pageName).catch(() => {});
            }
        }
    }, [routePathname, isAuthenticated, Pages, mainPageKey]);

    return null;
}
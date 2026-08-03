'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

const TenantContext = createContext(null)

export function TenantProvider({ children }) {
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const resolveOrg = useCallback(async (rawSlug) => {
    if (!rawSlug) {
      setOrg(null)
      setLoading(false)
      return
    }
    setLoading(true)

    const cleanSlug = String(rawSlug)
      .toLowerCase()
      .trim()
      .replace(/%20|\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    const formattedName = decodeURIComponent(rawSlug)
      .replace(/-/g, " ")
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")

    try {
      const { supabase } = await import('@/lib/supabase')

      // Query database by exact or normalized slug
      const { data } = await supabase
        .from('organizations')
        .select('id, name, slug, domain, subdomain, status, theme_config, modules_config, logo_url')
        .or(`slug.eq.${cleanSlug},slug.eq.${rawSlug},subdomain.eq.${cleanSlug}`)
        .maybeSingle()

      if (data) {
        setOrg(data)
        setLoading(false)
        return
      }

      // Check localStorage for dynamically created orgs in platform console
      if (typeof window !== "undefined") {
        try {
          const localOrgs = JSON.parse(localStorage.getItem("created_orgs") || "[]")
          const foundLocal = localOrgs.find(
            (o) =>
              o.slug === cleanSlug ||
              o.slug === rawSlug ||
              (o.name && o.name.toLowerCase() === rawSlug.toLowerCase())
          )
          if (foundLocal) {
            setOrg(foundLocal)
            setLoading(false)
            return
          }
        } catch (e) {
          console.error("Error reading created_orgs from localStorage:", e)
        }
      }

      if (cleanSlug === 'rahmania' || cleanSlug === 'default') {
        setOrg({
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Rahmania Institute',
          slug: 'rahmania',
          domain: 'rahmaniainstitute.org',
          status: 'active',
          subscription_plan: 'enterprise'
        })
      } else if (cleanSlug === 'bushra-jahan' || cleanSlug === 'rrr') {
        setOrg({
          id: '00000000-0000-0000-0000-000000000002',
          name: 'Bushra Jahan School',
          slug: 'bushra-jahan',
          domain: 'bushrajahan.edu',
          status: 'active',
          subscription_plan: 'yearly'
        })
      } else if (cleanSlug === 'noorania') {
        setOrg({
          id: '00000000-0000-0000-0000-000000000003',
          name: 'Noorania Madrasah',
          slug: 'noorania',
          domain: 'noorania.edu',
          status: 'active',
          subscription_plan: 'monthly'
        })
      } else if (rawSlug && rawSlug.length >= 2) {
        // Dynamic Organization Fallback for new school creation
        setOrg({
          id: `org_${cleanSlug || Date.now()}`,
          name: formattedName || 'New Educational Institution',
          slug: cleanSlug || rawSlug,
          domain: `${cleanSlug || 'school'}.platform.com`,
          status: 'active',
          subscription_plan: 'free'
        })
      } else {
        setOrg(null)
      }
    } catch (err) {
      console.error('Failed to resolve org:', err)
      if (rawSlug && rawSlug.length >= 2) {
        setOrg({
          id: `org_${cleanSlug || Date.now()}`,
          name: formattedName || 'New Educational Institution',
          slug: cleanSlug || rawSlug,
          domain: `${cleanSlug || 'school'}.platform.com`,
          status: 'active',
          subscription_plan: 'free'
        })
      } else {
        setOrg(null)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const slug = searchParams?.get('slug')
    if (slug) {
      resolveOrg(slug)
    } else {
      setLoading(false)
    }
  }, [searchParams, resolveOrg])

  return (
    <TenantContext.Provider value={{ org, loading, resolveOrg }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return ctx
}

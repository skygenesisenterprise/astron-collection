'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { routing } from '@/i18n/routing'
import { getDomainUrl } from '@/lib/domains'
import { isProfileSelected } from '@/lib/profile-selection'

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated && isProfileSelected()) {
      // Profile already selected — go straight to discover
      const locale = routing.defaultLocale
      window.location.href = getDomainUrl('main', `/${locale}/discover`)
    } else if (isAuthenticated) {
      // Authenticated but no profile selected — go to SSO
      window.location.href = getDomainUrl('sso', '/profile-change')
    } else {
      router.replace(`/${routing.defaultLocale}/discover`)
    }
  }, [isLoading, isAuthenticated, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Chargement…
    </div>
  )
}

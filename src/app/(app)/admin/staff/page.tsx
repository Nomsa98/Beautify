'use client'

import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Loading from '@/app/(app)/Loading'

export default function StaffRedirect() {
  const { user } = useAuth({ middleware: 'auth' })
  const router = useRouter()

  useEffect(() => {
    // Redirect to user management page which has full staff management functionality
    router.push('/admin/users')
  }, [router])

  return <Loading />
}

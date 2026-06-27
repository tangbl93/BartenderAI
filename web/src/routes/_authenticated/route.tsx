import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const token = useAuthStore.getState().auth.accessToken
    if (!token) {
      const current = window.location.pathname + window.location.search
      throw redirect({
        to: '/sign-in',
        search: { redirect: current },
        replace: true,
      })
    }
  },
  component: AuthenticatedLayout,
})

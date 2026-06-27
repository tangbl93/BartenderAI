import { createFileRoute } from '@tanstack/react-router'
import { UserDetail } from '@/features/users/detail'

function UserDetailRoute() {
  const { id } = Route.useParams()
  return <UserDetail id={id} />
}

export const Route = createFileRoute('/_authenticated/users/$id')({
  component: UserDetailRoute,
})

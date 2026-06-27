import { createFileRoute } from '@tanstack/react-router'
import { Ingredients } from '@/features/ingredients'

export const Route = createFileRoute('/_authenticated/ingredients/')({
  component: Ingredients,
})

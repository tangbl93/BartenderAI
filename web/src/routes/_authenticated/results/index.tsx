import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Results } from '@/features/results'

const resultsSearchSchema = z.object({
  userId: z.string().optional().catch(''),
  type: z
    .union([z.literal('all'), z.literal('recipe'), z.literal('poster')])
    .optional()
    .catch('all'),
})

export const Route = createFileRoute('/_authenticated/results/')({
  validateSearch: resultsSearchSchema,
  component: Results,
})

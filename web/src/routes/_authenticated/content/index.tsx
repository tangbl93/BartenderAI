import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Content } from '@/features/content'

const contentSearchSchema = z.object({
  userId: z.string().optional().catch(''),
  status: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/content/')({
  validateSearch: contentSearchSchema,
  component: Content,
})

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type StyleTemplate } from '@/lib/types'

export function useTemplates() {
  return useQuery<StyleTemplate[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const res = await api.get<StyleTemplate[]>('/admin/templates')
      return res.data
    },
  })
}

interface TemplateInput {
  name: string
  dimension: string
  prompt: string
  layout: {
    textAlign?: string
    watermarkPosition?: string
  }
  textRenderMode: string
  enabled: boolean
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: TemplateInput) => {
      const res = await api.post<StyleTemplate>('/admin/templates', input)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      toast.success('模板已创建')
    },
  })
}

export function useUpdateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: TemplateInput
    }) => {
      const res = await api.put<StyleTemplate>(`/admin/templates/${id}`, input)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      toast.success('模板已更新')
    },
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/templates/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      toast.success('模板已删除')
    },
  })
}

export function useUploadReferenceImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post<{ referenceImageUrl: string }>(
        `/admin/templates/${id}/reference-image`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      toast.success('参考图已上传')
    },
  })
}

export function useGenerateTemplateImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<{ referenceImageUrl: string }>(
        `/admin/templates/${id}/generate-image`
      )
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      toast.success('参考图已生成')
    },
    onError: () => toast.error('生成失败，请重试'),
  })
}

export type { StyleTemplate }

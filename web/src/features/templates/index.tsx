import { useState } from 'react'
import { Plus, Pencil, Trash2, Upload, Sparkles } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useCreateTemplate,
  useDeleteTemplate,
  useGenerateTemplateImage,
  useTemplates,
  useUpdateTemplate,
  useUploadReferenceImage,
} from './api/templates-api'
import { type StyleTemplate } from '@/lib/types'

const DIMENSION_LABELS: Record<string, string> = {
  home_closeup: '家庭特写',
  bar_commercial: '酒吧商业',
  steps_long: '步骤长图',
  custom: '自定义',
}
const DIMENSIONS = Object.keys(DIMENSION_LABELS)

const TEXT_ALIGN_LABELS: Record<string, string> = {
  left: '左对齐',
  center: '居中',
  right: '右对齐',
}
const WATERMARK_LABELS: Record<string, string> = {
  'top-left': '左上',
  'top-right': '右上',
  'bottom-left': '左下',
  'bottom-right': '右下',
  center: '居中',
}
const RENDER_MODE_LABELS: Record<string, string> = {
  model: '模型渲染',
  backend: '后端叠加',
}

export function Templates() {
  const { data, isLoading } = useTemplates()
  const createMut = useCreateTemplate()
  const updateMut = useUpdateTemplate()
  const deleteMut = useDeleteTemplate()
  const uploadMut = useUploadReferenceImage()
  const generateMut = useGenerateTemplateImage()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [current, setCurrent] = useState<StyleTemplate | null>(null)
  const [name, setName] = useState('')
  const [dimension, setDimension] = useState('home_closeup')
  const [prompt, setPrompt] = useState('')
  const [textAlign, setTextAlign] = useState('center')
  const [watermark, setWatermark] = useState('bottom-right')
  const [renderMode, setRenderMode] = useState('backend')
  const [enabled, setEnabled] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<StyleTemplate | null>(null)

  const items = data ?? []

  function openCreate() {
    setCurrent(null)
    setName('')
    setDimension('home_closeup')
    setPrompt('')
    setTextAlign('center')
    setWatermark('bottom-right')
    setRenderMode('backend')
    setEnabled(true)
    setDrawerOpen(true)
  }

  function openEdit(t: StyleTemplate) {
    setCurrent(t)
    setName(t.name)
    setDimension(t.dimension)
    setPrompt(t.prompt)
    setTextAlign(t.layout?.textAlign ?? 'center')
    setWatermark(t.layout?.watermarkPosition ?? 'bottom-right')
    setRenderMode(t.textRenderMode)
    setEnabled(t.enabled)
    setDrawerOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name,
      dimension,
      prompt,
      layout: { textAlign, watermarkPosition: watermark },
      textRenderMode: renderMode,
      enabled,
    }
    if (current) {
      updateMut.mutate({ id: current.id, input: payload })
    } else {
      createMut.mutate(payload)
    }
    setDrawerOpen(false)
  }

  function handleUpload(id: string, file: File) {
    uploadMut.mutate({ id, file })
  }

  function confirmDelete() {
    if (deleteTarget) {
      deleteMut.mutate(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>模板管理</h2>
            <p className='text-muted-foreground'>管理海报风格模板与参考图</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className='size-4' /> 新增模板
          </Button>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-16'>插图</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>版本</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className='text-end'>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='h-24 text-center text-muted-foreground'
                  >
                    加载中...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='h-24 text-center text-muted-foreground'
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                items.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {t.referenceImageUrl ? (
                        <img
                          src={t.referenceImageUrl}
                          alt={t.name}
                          className='size-10 rounded-md object-cover'
                          loading='lazy'
                        />
                      ) : (
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={generateMut.isPending}
                          onClick={() => generateMut.mutate(t.id)}
                        >
                          <Sparkles className='size-4' />
                          {generateMut.isPending &&
                          generateMut.variables === t.id
                            ? '生成中'
                            : '生成'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className='font-medium'>{t.name}</TableCell>
                    <TableCell className='text-muted-foreground'>
                      v{t.version}
                    </TableCell>
                    <TableCell>
                      {t.enabled ? (
                        <Badge variant='secondary'>启用</Badge>
                      ) : (
                        <Badge variant='destructive'>停用</Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openEdit(t)}
                      >
                        <Pencil className='size-4' /> 编辑
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-destructive'
                        onClick={() => setDeleteTarget(t)}
                      >
                        <Trash2 className='size-4' /> 删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Main>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className='flex flex-col'>
          <SheetHeader className='text-start'>
            <SheetTitle>{current ? '编辑模板' : '新增模板'}</SheetTitle>
            <SheetDescription>
              填写模板信息。完成后点击保存。
            </SheetDescription>
          </SheetHeader>
          <form
            id='template-form'
            onSubmit={handleSubmit}
            className='flex-1 space-y-5 overflow-y-auto px-4'
          >
            <div className='space-y-2'>
              <Label>名称</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='模板名称'
              />
            </div>
            <div className='space-y-2'>
              <Label>尺寸 / 维度</Label>
              <Select value={dimension} onValueChange={setDimension}>
                <SelectTrigger>
                  <SelectValue placeholder='选择尺寸' />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {DIMENSION_LABELS[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>提示词 (Prompt)</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='输入生成提示词'
                rows={4}
              />
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <Label>文字对齐</Label>
                <Select value={textAlign} onValueChange={setTextAlign}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TEXT_ALIGN_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>水印位置</Label>
                <Select value={watermark} onValueChange={setWatermark}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WATERMARK_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='space-y-2'>
              <Label>文字渲染模式</Label>
              <Select value={renderMode} onValueChange={setRenderMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RENDER_MODE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center gap-2'>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
              <Label>启用</Label>
            </div>

            {current && (
              <div className='space-y-2 border-t pt-4'>
                <Label>参考图</Label>
                {current.referenceImageUrl && (
                  <img
                    src={current.referenceImageUrl}
                    alt='参考图'
                    className='max-h-40 rounded border'
                  />
                )}
                <div className='flex items-center gap-2'>
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleUpload(current.id, f)
                    }}
                    className='text-xs'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    disabled={uploadMut.isPending}
                  >
                    <Upload className='size-4' /> 上传
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  当前版本 v{current.version}
                </p>
              </div>
            )}
          </form>
          <SheetFooter className='gap-2'>
            <SheetClose asChild>
              <Button variant='outline'>取消</Button>
            </SheetClose>
            <Button
              form='template-form'
              type='submit'
              disabled={createMut.isPending || updateMut.isPending}
            >
              保存
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title='删除模板'
        desc={`确定要删除模板「${deleteTarget?.name ?? ''}」吗？此操作不可撤销。`}
        confirmText='删除'
        destructive
        handleConfirm={confirmDelete}
      />
    </>
  )
}

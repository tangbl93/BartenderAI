import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
  useCreateIngredient,
  useDeleteIngredient,
  useIngredients,
  useUpdateIngredient,
} from './api/ingredients-api'
import { type Ingredient, type LocaleNames } from '@/lib/types'

const LOCALES: { key: keyof LocaleNames; label: string }[] = [
  { key: 'en', label: '英文' },
  { key: 'zh-CN', label: '简体中文' },
  { key: 'zh-TW', label: '繁体中文' },
  { key: 'ja', label: '日文' },
  { key: 'ko', label: '韩文' },
]

const CATEGORY_LABELS: Record<string, string> = {
  base_spirit: '基酒',
  drink: '饮料',
  fruit: '水果',
  snack: '小食',
}

const CATEGORIES = Object.keys(CATEGORY_LABELS)

function emptyNames(): LocaleNames {
  return { en: '', 'zh-CN': '', 'zh-TW': '', ja: '', ko: '' }
}

export function Ingredients() {
  const { data, isLoading } = useIngredients()
  const createMut = useCreateIngredient()
  const updateMut = useUpdateIngredient()
  const deleteMut = useDeleteIngredient()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [current, setCurrent] = useState<Ingredient | null>(null)
  const [category, setCategory] = useState('base_spirit')
  const [enabled, setEnabled] = useState(true)
  const [names, setNames] = useState<LocaleNames>(emptyNames())
  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null)
  const [search, setSearch] = useState('')

  const items = data ?? []
  const filtered = items.filter((it) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      it.name?.toLowerCase().includes(s) ||
      Object.values(it.names ?? {}).some((n) => n?.toLowerCase().includes(s))
    )
  })

  function openCreate() {
    setCurrent(null)
    setCategory('base_spirit')
    setEnabled(true)
    setNames(emptyNames())
    setDrawerOpen(true)
  }

  function openEdit(it: Ingredient) {
    setCurrent(it)
    setCategory(it.category)
    setEnabled(it.enabled)
    setNames({ ...emptyNames(), ...(it.names ?? {}) })
    setDrawerOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { category, names, enabled }
    if (current) {
      updateMut.mutate({ id: current.id, input: payload })
    } else {
      createMut.mutate(payload)
    }
    setDrawerOpen(false)
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
            <h2 className='text-2xl font-bold tracking-tight'>材料管理</h2>
            <p className='text-muted-foreground'>管理鸡尾酒材料与多语言名称</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className='size-4' /> 新增材料
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          <Input
            placeholder='搜索材料名称...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='max-w-xs'
          />
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-16'>配图</TableHead>
                <TableHead>显示名</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>简体中文</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className='text-end'>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='h-24 text-center text-muted-foreground'
                  >
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='h-24 text-center text-muted-foreground'
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>
                      {it.imageUrl ? (
                        <img
                          src={it.imageUrl}
                          alt={it.name}
                          className='size-10 rounded-md object-cover'
                          loading='lazy'
                        />
                      ) : (
                        <div className='flex size-10 items-center justify-center rounded-md border border-dashed text-muted-foreground text-xs'>
                          —
                        </div>
                      )}
                    </TableCell>
                    <TableCell className='font-medium'>{it.name}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {CATEGORY_LABELS[it.category] ?? it.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{it.names?.['zh-CN'] || '-'}</TableCell>
                    <TableCell>
                      {it.enabled ? (
                        <Badge variant='secondary'>启用</Badge>
                      ) : (
                        <Badge variant='destructive'>停用</Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openEdit(it)}
                      >
                        <Pencil className='size-4' /> 编辑
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-destructive'
                        onClick={() => setDeleteTarget(it)}
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
            <SheetTitle>{current ? '编辑材料' : '新增材料'}</SheetTitle>
            <SheetDescription>
              填写材料信息，包括 5 语种名称。完成后点击保存。
            </SheetDescription>
          </SheetHeader>
          <form
            id='ingredient-form'
            onSubmit={handleSubmit}
            className='flex-1 space-y-5 overflow-y-auto px-4'
          >
            <div className='space-y-2'>
              <Label>分类</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder='选择分类' />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-3'>
              <Label>多语言名称</Label>
              {LOCALES.map((l) => (
                <div key={l.key} className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>
                    {l.label}
                  </Label>
                  <Input
                    value={names[l.key] ?? ''}
                    onChange={(e) =>
                      setNames((prev) => ({
                        ...prev,
                        [l.key]: e.target.value,
                      }))
                    }
                    placeholder={l.label}
                  />
                </div>
              ))}
            </div>
            <div className='flex items-center gap-2'>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
              <Label>启用</Label>
            </div>
          </form>
          <SheetFooter className='gap-2'>
            <SheetClose asChild>
              <Button variant='outline'>取消</Button>
            </SheetClose>
            <Button
              form='ingredient-form'
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
        title='删除材料'
        desc={`确定要删除材料「${deleteTarget?.name ?? ''}」吗？此操作不可撤销。`}
        confirmText='删除'
        destructive
        handleConfirm={confirmDelete}
      />
    </>
  )
}

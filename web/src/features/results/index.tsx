import { useState } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useResults } from './api/results-api'
import { type ResultItem } from '@/lib/types'

export function Results() {
  const routeSearch = useSearch({ from: '/_authenticated/results/' })
  const navigate = useNavigate()
  const [userId, setUserId] = useState(routeSearch.userId ?? '')
  const [type, setType] = useState<'all' | 'recipe' | 'poster'>(
    routeSearch.type ?? 'all'
  )
  const [page, setPage] = useState(1)
  const [size] = useState(24)
  const [preview, setPreview] = useState<ResultItem | null>(null)

  const { data, isLoading, isFetching } = useResults({
    userId: userId || undefined,
    type: type === 'all' ? undefined : type,
    page,
    size,
  })
  void navigate

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / size))

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>结果画廊</h2>
          <p className='text-muted-foreground'>
            浏览生成的海报与配方
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='按用户 ID 筛选'
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value)
              setPage(1)
            }}
            className='max-w-xs'
          />
          <Select
            value={type}
            onValueChange={(v: 'all' | 'recipe' | 'poster') => {
              setType(v)
              setPage(1)
            }}
          >
            <SelectTrigger className='w-36'>
              <SelectValue placeholder='类型' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部</SelectItem>
              <SelectItem value='poster'>海报</SelectItem>
              <SelectItem value='recipe'>配方</SelectItem>
            </SelectContent>
          </Select>
          <span className='text-sm text-muted-foreground'>
            {isFetching ? '（刷新中）' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className='text-muted-foreground'>加载中...</div>
        ) : items.length === 0 ? (
          <div className='text-muted-foreground'>暂无数据</div>
        ) : (
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
            {items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className='group cursor-pointer overflow-hidden rounded-lg border bg-card'
                onClick={() => setPreview(item)}
              >
                <div className='aspect-square overflow-hidden bg-muted'>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className='size-full object-cover transition group-hover:scale-105'
                    />
                  ) : (
                    <div className='flex size-full items-center justify-center p-2 text-center text-xs text-muted-foreground'>
                      {item.title || '配方'}
                    </div>
                  )}
                </div>
                <div className='space-y-1 p-2'>
                  <div className='truncate text-xs font-medium'>
                    {item.title}
                  </div>
                  <Badge variant={item.type === 'poster' ? 'secondary' : 'outline'}>
                    {item.type === 'poster' ? '海报' : '配方'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>共 {total} 条</span>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </Button>
            <span className='text-sm'>
              {page} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </Main>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className='max-w-2xl'>
          <DialogTitle>{preview?.title}</DialogTitle>
          <DialogDescription>
            {preview?.type === 'poster' ? '海报' : '配方'} · 创建于{' '}
            {preview
              ? new Date(preview.createdAt).toLocaleString('zh-CN')
              : ''}
          </DialogDescription>
          {preview?.imageUrl && (
            <img
              src={preview.imageUrl}
              alt={preview.title}
              className='w-full rounded'
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

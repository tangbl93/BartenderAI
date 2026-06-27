import { useState } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { ShieldAlert, Trash2 } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useDeleteContent,
  useHideContent,
  useSharedContent,
} from './api/content-api'
import { type LabEntry } from '@/lib/types'

const STATUS_LABELS: Record<string, string> = {
  private: '私密',
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
}

const STATUS_VARIANT: Record<string, 'secondary' | 'outline' | 'destructive'> = {
  private: 'outline',
  pending: 'secondary',
  approved: 'secondary',
  rejected: 'destructive',
}

export function Content() {
  const routeSearch = useSearch({ from: '/_authenticated/content/' })
  const navigate = useNavigate()
  const [userId, setUserId] = useState(routeSearch.userId ?? '')
  const [status, setStatus] = useState(routeSearch.status ?? '')
  const { data, isLoading, isFetching } = useSharedContent({
    userId: userId || undefined,
    status: status || undefined,
  })
  const hideMut = useHideContent()
  const deleteMut = useDeleteContent()

  const [confirmTarget, setConfirmTarget] = useState<{
    entry: LabEntry
    action: 'hide' | 'delete'
  } | null>(null)

  const items = data ?? []

  function handleConfirm() {
    if (!confirmTarget) return
    if (confirmTarget.action === 'hide') {
      hideMut.mutate(confirmTarget.entry.id)
    } else {
      deleteMut.mutate(confirmTarget.entry.id)
    }
    setConfirmTarget(null)
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
            <h2 className='text-2xl font-bold tracking-tight'>内容审核</h2>
            <p className='text-muted-foreground'>
              审核用户公开内容，可屏蔽或删除
            </p>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='按用户 ID 筛选'
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value)
              navigate({
                to: '/content',
                search: {
                  userId: e.target.value || undefined,
                  status: status || undefined,
                },
              })
            }}
            className='max-w-xs'
          />
          <Input
            placeholder='状态 (approved/pending/...);'
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              navigate({
                to: '/content',
                search: {
                  userId: userId || undefined,
                  status: e.target.value || undefined,
                },
              })
            }}
            className='max-w-xs'
          />
          <span className='text-sm text-muted-foreground'>
            {isFetching ? '（刷新中）' : ''}
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>内容</TableHead>
                <TableHead>结果</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
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
                items.map((entry) => {
                  const st = entry.moderationStatus ?? entry.status ?? 'pending'
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {entry.imageUrl && (
                            <img
                              src={entry.imageUrl}
                              alt=''
                              className='size-10 rounded object-cover'
                            />
                          )}
                          <div className='min-w-0'>
                            <div className='truncate font-medium'>
                              {entry.title || entry.note || entry.id}
                            </div>
                            {entry.note && (
                              <div className='truncate text-xs text-muted-foreground'>
                                {entry.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.result === 'success' ? (
                          <Badge variant='secondary'>成功</Badge>
                        ) : entry.result === 'fail' ? (
                          <Badge variant='destructive'>失败</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[st] ?? 'outline'}>
                          {STATUS_LABELS[st] ?? st}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {new Date(entry.createdAt).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell className='text-end'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            setConfirmTarget({ entry, action: 'hide' })
                          }
                        >
                          <ShieldAlert className='size-4' /> 屏蔽
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-destructive'
                          onClick={() =>
                            setConfirmTarget({ entry, action: 'delete' })
                          }
                        >
                          <Trash2 className='size-4' /> 删除
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Main>

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(o) => !o && setConfirmTarget(null)}
        title={
          confirmTarget?.action === 'hide' ? '屏蔽内容' : '删除内容'
        }
        desc={
          confirmTarget?.action === 'hide'
            ? '确定要屏蔽该内容吗？屏蔽后将不再公开展示。'
            : '确定要删除该内容吗？此操作不可撤销。'
        }
        confirmText={
          confirmTarget?.action === 'hide' ? '屏蔽' : '删除'
        }
        destructive
        handleConfirm={handleConfirm}
      />
    </>
  )
}

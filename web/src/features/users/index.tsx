import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useUsers } from './api/users-api'
import { type AdminUser } from '@/lib/types'

function truncate(str: string | null | undefined, n = 12) {
  if (!str) return '-'
  return str.length > n ? `${str.slice(0, n)}…` : str
}

export function Users() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const navigate = useNavigate()

  const { data, isLoading, isFetching } = useUsers({ q, page, size })
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / size))

  const columns = useMemo(
    () => [
      { key: 'account', header: '账号' },
      { key: 'displayName', header: '昵称' },
      { key: 'deviceId', header: '设备 ID' },
      { key: 'type', header: '类型' },
      { key: 'role', header: '角色' },
      { key: 'createdAt', header: '注册时间' },
    ],
    []
  )

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
            <h2 className='text-2xl font-bold tracking-tight'>用户列表</h2>
            <p className='text-muted-foreground'>管理所有用户与角色</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Input
            placeholder='搜索账号或昵称...'
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            className='max-w-xs'
          />
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key}>{c.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center text-muted-foreground'
                  >
                    加载中...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center text-muted-foreground'
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                items.map((u: AdminUser) => (
                  <TableRow
                    key={u.id}
                    className='cursor-pointer hover:bg-muted'
                    onClick={() =>
                      navigate({ to: '/users/$id', params: { id: u.id } })
                    }
                  >
                    <TableCell>{u.account}</TableCell>
                    <TableCell>{u.displayName || '-'}</TableCell>
                    <TableCell className='font-mono text-xs'>
                      {truncate(u.deviceId)}
                    </TableCell>
                    <TableCell>
                      {u.isDevice ? (
                        <Badge variant='secondary'>设备</Badge>
                      ) : (
                        <Badge variant='outline'>普通</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{u.role}</Badge>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {new Date(u.createdAt).toLocaleString('zh-CN')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>
            共 {total} 条 {isFetching ? '（刷新中）' : ''}
          </span>
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
            <select
              className='ms-2 h-8 rounded border bg-background px-2 text-sm'
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value))
                setPage(1)
              }}
            >
              <option value={10}>10 / 页</option>
              <option value={20}>20 / 页</option>
              <option value={50}>50 / 页</option>
            </select>
          </div>
        </div>
      </Main>
    </>
  )
}

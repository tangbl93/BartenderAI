import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from './api/users-api'

interface UserDetailProps {
  id: string
}

export function UserDetail({ id }: UserDetailProps) {
  const { data, isLoading } = useUser(id)

  if (isLoading) {
    return (
      <>
        <Header fixed>
          <Search className='me-auto' />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </Header>
        <Main>
          <div className='text-muted-foreground'>加载中...</div>
        </Main>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <Header fixed>
          <Search className='me-auto' />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </Header>
        <Main>
          <div className='text-muted-foreground'>未找到该用户</div>
        </Main>
      </>
    )
  }

  const { user, counts } = data

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-col gap-6'>
        <div>
          <Button variant='ghost' size='sm' asChild className='mb-2'>
            <Link to='/users'>
              <ArrowLeft className='size-4' /> 返回用户列表
            </Link>
          </Button>
          <h2 className='text-2xl font-bold tracking-tight'>用户详情</h2>
          <p className='text-muted-foreground'>查看用户信息与活动统计</p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>实验室记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {counts?.labEntries ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>配方数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{counts?.recipes ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>海报数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{counts?.posters ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className='grid gap-x-6 gap-y-3 sm:grid-cols-2'>
              <div>
                <dt className='text-sm text-muted-foreground'>账号</dt>
                <dd className='font-medium'>{user.account}</dd>
              </div>
              <div>
                <dt className='text-sm text-muted-foreground'>昵称</dt>
                <dd className='font-medium'>{user.displayName || '-'}</dd>
              </div>
              <div>
                <dt className='text-sm text-muted-foreground'>类型</dt>
                <dd>
                  {user.isDevice ? (
                    <Badge variant='secondary'>设备</Badge>
                  ) : (
                    <Badge variant='outline'>普通</Badge>
                  )}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-muted-foreground'>角色</dt>
                <dd>
                  <Badge variant='outline'>{user.role}</Badge>
                </dd>
              </div>
              <div>
                <dt className='text-sm text-muted-foreground'>设备 ID</dt>
                <dd className='font-mono text-xs'>
                  {user.deviceId || '-'}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-muted-foreground'>注册时间</dt>
                <dd className='font-medium'>
                  {new Date(user.createdAt).toLocaleString('zh-CN')}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className='flex gap-2'>
          <Button asChild variant='outline'>
            <Link to='/content' search={{ userId: user.id }}>
              查看该用户内容
            </Link>
          </Button>
          <Button asChild variant='outline'>
            <Link to='/results' search={{ userId: user.id }}>
              查看该用户结果
            </Link>
          </Button>
        </div>
      </Main>
    </>
  )
}

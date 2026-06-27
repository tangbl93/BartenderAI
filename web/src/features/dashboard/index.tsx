import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useDashboard } from './api/dashboard-api'

export function Dashboard() {
  const { data, isLoading } = useDashboard()

  const recipeCount = data?.recipeCount ?? 0
  const posterCount = data?.posterCount ?? 0
  const submissionCount = data?.submissionCount ?? 0
  const approvalRate = data?.approvalRate ?? 0
  const topIngredients = data?.topIngredients ?? []
  const topStyles = data?.topStyles ?? []

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>仪表盘</h1>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>配方总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{recipeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>海报总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{posterCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>提交总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{submissionCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>通过率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {(approvalRate * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>热门材料 Top 10</CardTitle>
              <CardDescription>使用次数最多的材料</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='text-muted-foreground'>加载中...</div>
              ) : topIngredients.length === 0 ? (
                <div className='text-muted-foreground'>暂无数据</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>材料</TableHead>
                      <TableHead className='text-end'>使用次数</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topIngredients.map((it) => (
                      <TableRow key={it.name}>
                        <TableCell>{it.name}</TableCell>
                        <TableCell className='text-end'>{it.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>热门风格 Top 10</CardTitle>
              <CardDescription>使用次数最多的模板风格</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='text-muted-foreground'>加载中...</div>
              ) : topStyles.length === 0 ? (
                <div className='text-muted-foreground'>暂无数据</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>风格</TableHead>
                      <TableHead className='text-end'>使用次数</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topStyles.map((it) => (
                      <TableRow key={it.name}>
                        <TableCell>{it.name}</TableCell>
                        <TableCell className='text-end'>{it.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

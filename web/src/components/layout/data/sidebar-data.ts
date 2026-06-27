import {
  LayoutDashboard,
  Users,
  Wine,
  LayoutTemplate,
  ShieldAlert,
  Images,
  Command,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '管理员',
    email: 'admin@bartender.ai',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Bartender AI',
      logo: Command,
      plan: '管理后台',
    },
  ],
  navGroups: [
    {
      title: '内容运营',
      items: [
        {
          title: '仪表盘',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: '用户',
          url: '/users',
          icon: Users,
        },
        {
          title: '材料',
          url: '/ingredients',
          icon: Wine,
        },
        {
          title: '模板',
          url: '/templates',
          icon: LayoutTemplate,
        },
        {
          title: '内容审核',
          url: '/content',
          icon: ShieldAlert,
        },
        {
          title: '结果画廊',
          url: '/results',
          icon: Images,
        },
      ],
    },
  ],
}

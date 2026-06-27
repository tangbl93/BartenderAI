import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/app/fridge' },

  // ---- 前台 (user site) ----
  {
    path: '/app',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      { path: '', redirect: '/app/fridge' },
      { path: 'fridge', name: 'fridge', component: () => import('@/views/app/FridgeView.vue') },
      {
        path: 'recipe/:id',
        name: 'recipe',
        component: () => import('@/views/app/RecipeView.vue'),
        props: true,
      },
      {
        path: 'poster/:recipeId',
        name: 'poster',
        component: () => import('@/views/app/PosterView.vue'),
        props: true,
        meta: { requiresUser: true },
      },
      {
        path: 'lab',
        name: 'lab',
        component: () => import('@/views/app/LabView.vue'),
        meta: { requiresUser: true },
      },
      {
        path: 'lab/:id',
        name: 'lab-detail',
        component: () => import('@/views/app/LabDetailView.vue'),
        props: true,
        meta: { requiresUser: true },
      },
      { path: 'wall', name: 'wall', component: () => import('@/views/app/WallView.vue') },
    ],
  },

  // ---- auth ----
  { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('@/views/auth/RegisterView.vue') },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/auth/AdminLoginView.vue'),
  },

  // ---- 管理后台 (admin) ----
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
      },
      {
        path: 'ingredients',
        name: 'admin-ingredients',
        component: () => import('@/views/admin/IngredientsView.vue'),
      },
      {
        path: 'templates',
        name: 'admin-templates',
        component: () => import('@/views/admin/TemplatesView.vue'),
      },
      {
        path: 'moderation',
        name: 'admin-moderation',
        component: () => import('@/views/admin/ModerationView.vue'),
      },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/app/fridge' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Admin area: must be an operator/admin.
  if (to.meta.requiresAdmin) {
    if (!auth.isAuthenticated || !auth.isAdminUser) {
      return { name: 'admin-login', query: { redirect: to.fullPath } }
    }
  }

  // User-only front-stage routes.
  if (to.meta.requiresUser) {
    if (!auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    // A pure front-stage user token must not be elevated; admin/operator are fine browsing.
  }

  return true
})

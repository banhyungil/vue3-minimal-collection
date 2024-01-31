import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/css',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/css/CssView.vue'),
      children: [
        {
          path: '',
          name: 'layout-ani',
          component: () => import('../views/css/CssLayoutAnimation.vue')
        }
      ]
    }
  ]
})

export default router

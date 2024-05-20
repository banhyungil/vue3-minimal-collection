import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/css',
      name: 'css',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/vcss/CssView.vue'),
      children: [
        {
          path: '',
          name: 'layout-ani',
          component: () => import('../views/vcss/CssLayoutAnimation.vue'),
        },
        {
          path: '/grid',
          name: 'grid',
          component: () => import('../views/vcss/CssGrid.vue'),
        },
      ],
    },
    {
      path: '/errorHandler',
      name: 'errorHandler',
      component: () => import('../views/ErrorHandlerView.vue'),
    },
    {
      path: '/kakaoMap',
      name: 'kakaoMap',
      component: () => import('../views/KakaoMapView.vue'),
    },
    {
      path: '/vuelify',
      name: 'vuelify',
      component: () => import('../views/VuelifyView.vue'),
    },
    {
      path: '/openLayer',
      name: 'openLayer',
      component: () => import('../views/OpenLayerView.vue'),
    },
  ],
})

export default router

import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("@/views/home/Home.vue"),
    },
    {
      path: "/tools",
      children: [
        // 色值转换
        {
          path: "colortrans",
          component: () => import("@/views/tools/ColorTransform.vue"),
        },
        // 正则解析器
        {
          path: "regular",
          component: () => import("@/views/tools/RegularParse.vue"),
        },
        // 命名格式转换
        {
          path: "conversion",
          component: () => import("@/views/tools/CaseConversion.vue"),
        },
      ]
    }
  ],
})

export default router

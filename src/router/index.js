import { createRouter, createWebHistory } from "vue-router";
import { useTokenStore } from "@/stores/token"; // 引入 Pinia store

import LoginVue from "@/views/Login.vue"
import LayoutVue from "@/views/Layout.vue"
import SysUserManageVue from "@/views/sys/UserManage.vue"
import SysDbDesignVue from "@/views/sys/DbDesign.vue"
import CornCobPurchaseVue from "@/views/Grain/CornCobPurchase.vue"
import CornGrainPurchaseVue from "@/views/Grain/CornGrainPurchase.vue"
import CornGrainSellVue from "@/views/Grain/CornGrainSell.vue"
import NongziStockVue from "@/views/nongzi/NongziStock.vue";
import NongziSellVue from "@/views/nongzi/NongziSell.vue";
import WorkerAttendanceVue from "@/views/Worker/WorkerAttendance.vue";

const routes = [
  {
    path: '/login',
    component: LoginVue,
  },
  {
    path: '/',
    component: LayoutVue,
    meta: { requiresAuth: true }, // 需要认证的路由
    children: [
      {
        path: '/sys/UserManage',
        component: SysUserManageVue,
      },
      {
        path: '/sys/DbDesign',
        component: SysDbDesignVue,
      },
      // 粮食买卖
      {
        path: '/Grain/CornCobPurchase',
        component: CornCobPurchaseVue,
      },
      {
        path: '/Grain/CornGrainPurchase',
        component: CornGrainPurchaseVue,
      },
      {
        path: '/Grain/CornGrainSell',
        component: CornGrainSellVue,
      },
      // 农资交易
      {
        path: '/Nongzi/NongziStock',
        component: NongziStockVue,
      },
      {
        path: '/Nongzi/NongziSell',
        component: NongziSellVue,
      },
      // 人员管理
      {
        path: '/Worker/WorkerAttendance',
        component: WorkerAttendanceVue,
      },
    ],
  },
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

router.beforeEach((to, from, next) => {
  // 检查是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果是需要认证的路由，检查用户是否已登录
    const tokenStore = useTokenStore();
    if (!tokenStore.token) {
      // 如果没有token，重定向到登录页
      next({ path: '/login' });
    } else {
      // 如果有token，继续导航
      next();
    }
  } else {
    // 不需要认证的路由，直接导航
    next();
  }
});

export default router
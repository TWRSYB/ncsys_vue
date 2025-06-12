import { createRouter, createWebHistory } from "vue-router";

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

export default router
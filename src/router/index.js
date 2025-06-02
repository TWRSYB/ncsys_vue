import { createRouter, createWebHistory } from "vue-router";

import LoginVue from "@/views/Login.vue"
import LayoutVue from "@/views/Layout.vue"
import SysUserManageVue from "@/views/sys/UserManage.vue"
import SysDbDesignVue from "@/views/sys/DbDesign.vue"

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
    ],
  },
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

export default router
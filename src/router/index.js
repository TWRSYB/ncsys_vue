import { createRouter, createWebHistory } from "vue-router";

import LoginVue from "@/views/Login.vue"
import LayoutVue from "@/views/Layout.vue"

const routes = [
  {
    path: '/login',
    component: LoginVue,
  },
  {
    path: '/',
    component: LayoutVue,
    // children: [
    //   {
    //     path: '/pathname',
    //     component: Feature,
    //   },
    // ],
  },
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

export default router
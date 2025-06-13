import { createRouter, createWebHistory } from "vue-router";
import { useTokenStore } from "@/stores/token"; // 引入 Pinia store

import CornGrainPurchaseVue from "@/views/Grain/CornGrainPurchase.vue"
import CornGrainSellVue from "@/views/Grain/CornGrainSell.vue"
import NongziStockVue from "@/views/nongzi/NongziStock.vue";
import NongziSellVue from "@/views/nongzi/NongziSell.vue";
import WorkerAttendanceVue from "@/views/Worker/WorkerAttendance.vue";
import PersonInfoVue from "@/views/Person/PersonInfo.vue";

const routes = [
    {
        path: '/login',
        component: () => import('@/views/Login.vue'),
    },
    {
        path: '/',
        component: () => import('@/views/Layout.vue'),
        meta: { requiresAuth: true }, // 需要认证的路由
        children: [
            {
                path: '/sys/UserManage',
                component: () => import('@/views/sys/UserManage.vue'),
            },
            {
                path: '/sys/DbDesign',
                component: () => import('@/views/sys/DbDesign.vue'),
            },
            // 粮食买卖
            {
                path: '/Grain/CornCobPurchase',
                component: () => import('@/views/Grain/CornCobPurchase.vue'),
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
            // 工人管理
            {
                path: '/Worker/WorkerAttendance',
                component: WorkerAttendanceVue,
            },
            // 人员信息维护
            {
                path: '/Person/PersonInfo',
                component: PersonInfoVue,
            },
            // 用户信息
            {
                path: '/User/UserInfo',
                component: () => import('@/views/User/UserInfo.vue'),
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
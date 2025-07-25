import { createRouter, createWebHistory, createWebHashHistory } from "vue-router";
import { useLoginUserStore } from "@/stores/loginUser";

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
                meta: { requiresAuth: true, roles: ['sysAdmin'] },
            },
            {
                path: '/sys/DbDesign',
                component: () => import('@/views/sys/DbDesign.vue'),
                meta: { requiresAuth: true, roles: ['sysAdmin'] },
            },
            // 粮食买卖
            // 玉米棒收购
            {
                path: '/Grain/CornCobPurchase',
                component: () => import('@/views/Grain/CornCobPurchase.vue'),
                meta: { requiresAuth: true, roles: ['sysAdmin', 'manager', 'operator'] },
            },
            // 玉米粒收购
            {
                path: '/Grain/CornGrainPurchase',
                component: CornGrainPurchaseVue,
                meta: { requiresAuth: true, roles: ['sysAdmin', 'manager', 'operator'] },
            },
            // 玉米粒出售
            {
                path: '/Grain/CornGrainSell',
                component: CornGrainSellVue,
                meta: { requiresAuth: true, roles: ['sysAdmin', 'manager', 'operator'] },
            },
            // 农资交易
            // 农资进货
            {
                path: '/Nongzi/NongziStock',
                component: NongziStockVue,
                meta: { requiresAuth: true, roles: ['sysAdmin', 'manager', 'operator'] },
            },
            // 农资销售
            {
                path: '/Nongzi/NongziSell',
                component: NongziSellVue,
                meta: { requiresAuth: true, roles: ['sysAdmin', 'manager', 'operator'] },
            },
            // 工人管理
            {
                path: '/Worker/WorkerAttendance',
                component: WorkerAttendanceVue,
                meta: { requiresAuth: true, roles: ['sysAdmin', 'manager'] },
            },
            // 信息维护
            // 人员信息
            {
                path: '/Person/PersonInfo',
                component: PersonInfoVue,
                meta: { requiresAuth: true, roles: ['sysAdmin', 'manager'] },
            },
            // 工人信息
            {
                path: '/Worker/WorkerInfo',
                component: () => import('@/views/Worker/WorkerInfo.vue'),
                meta: { requiresAuth: true, roles: ['sysAdmin', 'manager'] },
            },
            // 用户功能
            // 用户信息
            {
                path: '/User/UserInfo',
                component: () => import('@/views/User/UserInfo.vue'),
                meta: { requiresAuth: true, roles: ['sysAdmin', 'manager'] },
            },

        ],
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})

router.beforeEach((to, from, next) => {
    // 检查是否需要认证
    if (to.matched.some(record => record.meta.requiresAuth)) {
        // 如果是需要认证的路由，检查用户是否已登录
        const loginUserStore = useLoginUserStore();
        if (!loginUserStore.loginUser || !loginUserStore.loginUser.token) {
            // 如果没有token，重定向到登录页
            next({ path: '/login' });
        } else {
            // 检查用户角色是否满足当前路由的权限要求
            const requiredRoles = to.meta.roles;
            const userRole = useLoginUserStore().loginUser.roleCode;

            if (!requiredRoles || requiredRoles.length === 0 || requiredRoles.includes(userRole)) {
                // 用户角色符合要求，继续导航
                next();
            } else {
                // 用户角色不符合要求，跳转到无权限页面或登录页
                next({ path: '/' });
            }
        }
    } else {
        // 不需要认证的路由，直接导航
        next();
    }
});

export default router
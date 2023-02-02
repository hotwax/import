import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import PurchaseOrder from '@/views/PurchaseOrder.vue'
import Inventory from '@/views/Inventory.vue'
import InventoryDetail from '@/views/InventoryDetail.vue'
import PurchaseOrderReview from '@/views/PurchaseOrderReview.vue';
import Login from '@/views/Login.vue'
import SavedMappings from '@/views/SavedMappings.vue'
import Settings from "@/views/Settings.vue"
import store from '@/store'
import MappingDetail from '@/views/MappingDetail.vue'

const authGuard = (to: any, from: any, next: any) => {
  if (store.getters['user/isAuthenticated']) {
      next()
  } else {
    next("/login")
  }
};

const loginGuard = (to: any, from: any, next: any) => {
  if (!store.getters['user/isAuthenticated']) {
      next()
  } else {
    next("/")
  }
};

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/purchase-order'
  },
  {
    path: '/purchase-order',
    name: 'PurchaseOrder',
    component: PurchaseOrder,
    beforeEnter: authGuard
  },
  {
    path: '/purchase-order-review',
    name: 'PurchaseOrderReview',
    component: PurchaseOrderReview,
    beforeEnter: authGuard
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: Inventory,
    beforeEnter: authGuard
  },
  {
    path: '/inventory-detail',
    name: 'InventoryDetail',
    component: InventoryDetail,
    beforeEnter: authGuard
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: loginGuard
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    beforeEnter: authGuard
  },
  {
    path: "/saved-mappings",
    name: "SavedMappings",
    component: SavedMappings,
    beforeEnter: authGuard
  },
  {
    path: "/mapping/:id",
    name: "MappingDetail",
    component: MappingDetail,
    beforeEnter: authGuard
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
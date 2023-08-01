import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import PurchaseOrder from '@/views/PurchaseOrder.vue'
import Inventory from '@/views/Inventory.vue'
import InventoryReview from '@/views/InventoryReview.vue'
import PurchaseOrderReview from '@/views/PurchaseOrderReview.vue';
import SavedMappings from '@/views/SavedMappings.vue'
import Settings from "@/views/Settings.vue"
import store from '@/store'
import MappingDetail from '@/views/MappingDetail.vue'
import { Login, useAuthStore } from '@hotwax/dxp-components';
import { loader } from '@/user-utils';

const authGuard = async (to: any, from: any, next: any) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated || !store.getters['user/isAuthenticated']) {
    await loader.present('Authenticating')
    // TODO use authenticate() when support is there
    const redirectUrl = window.location.origin + '/login'
    window.location.href = `${process.env.VUE_APP_LOGIN_URL}?redirectUrl=${redirectUrl}`
    loader.dismiss()
  }
  next()
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
    path: '/inventory-review',
    name: 'InventoryDetail',
    component: InventoryReview,
    beforeEnter: authGuard
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
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
    path: "/mapping/:mappingType/:id",
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
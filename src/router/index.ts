import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import AdjustInventory from '@/views/AdjustInventory.vue';
import AdjustInventoryHistory from '@/views/AdjustInventoryHistory.vue';
import PurchaseOrder from '@/views/PurchaseOrder.vue'
import Inventory from '@/views/Inventory.vue'
import InventoryReview from '@/views/InventoryReview.vue'
import PurchaseOrderReview from '@/views/PurchaseOrderReview.vue';
import SavedMappings from '@/views/SavedMappings.vue'
import Settings from "@/views/Settings.vue"
import ScheduledIncomingInventory from '@/views/ScheduledIncomingInventory.vue';
import ScheduledRestock from "@/views/ScheduledRestock.vue";
import ScheduledRestockReview from "@/views/ScheduledRestockReview.vue"
import UnifiedInventory from '@/views/UnifiedInventory.vue';
import store from '@/store'
import MappingDetail from '@/views/MappingDetail.vue'
import { DxpLogin, translate, useAuthStore } from '@hotwax/dxp-components';
import { loader } from '@/user-utils';
import { showToast } from '@/utils';
import { hasPermission } from '@/authorization';

// Defining types for the meta values
declare module 'vue-router' {
  interface RouteMeta {
    permissionId?: string;
  }
}

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

const loginGuard = (to: any, from: any, next: any) => {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated && !to.query?.token && !to.query?.oms) {
    next('/')
  }
  next();
};

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/unified-inventory'
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
    beforeEnter: authGuard,
    meta: {
      permissionId: "APP_INVENTORY_VIEW"
    }
  },
  {
    path: '/unified-inventory',
    name: 'UnifiedInventory',
    component: UnifiedInventory,
    beforeEnter: authGuard,
  },
  {
    path: '/scheduled-incoming-inventory',
    name: 'ScheduledIncomingInventory',
    component: ScheduledIncomingInventory,
    beforeEnter: authGuard,
  },
  {
    path: '/adjust-inventory',
    name: 'AdjustInventory',
    component: AdjustInventory,
    beforeEnter: authGuard,
  },
  {
    path: '/adjust-inventory_history',
    name: 'AdjustInventoryHistory',
    component: AdjustInventoryHistory,
    beforeEnter: authGuard,
  },
  {
    path: '/inventory-review',
    name: 'InventoryDetail',
    component: InventoryReview,
    beforeEnter: authGuard
  },
  {
    path: '/scheduled-restock',
    name: 'ScheduledRestock',
    component: ScheduledRestock,
    beforeEnter: authGuard
  },
  {
    path: '/scheduled-restock-review/:id',
    name: 'ScheduledRestockReview',
    component: ScheduledRestockReview,
    beforeEnter: authGuard
  },
  {
    path: '/login',
    name: 'Login',
    component: DxpLogin,
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

router.beforeEach((to, from) => {
  if (to.meta.permissionId && !hasPermission(to.meta.permissionId)) {
    let redirectToPath = from.path;
    // If the user has navigated from Login page or if it is page load, redirect user to settings page without showing any toast
    if (redirectToPath == "/login" || redirectToPath == "/") redirectToPath = "/settings";
    else {
      showToast(translate('You do not have permission to access this page'));
    }
    return {
      path: redirectToPath,
    }
  }
})


export default router
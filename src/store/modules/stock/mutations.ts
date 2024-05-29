import { MutationTree } from 'vuex'
import StockState from './StockState'
import * as types from './mutation-types'

const mutations: MutationTree <StockState> = {
  [types.STOCK_ITEMS_UPDATED] (state, payload) {
    state.items.parsed = payload.parsed;
    state.items.original = payload.original;
    state.items.unidentifiedItems = payload.unidentifiedItems;
    state.items.initial = payload.initial;
  },
  [types.STOCK_SCHEDULE_ITEMS_UPDATED] (state, payload) {
    state.restockItems = payload;
  },
  [types.STOCK_SCHEDULED_INFORMATION] (state, payload) {
    state.schedule.scheduledTime = payload.scheduledTime;
    state.schedule.shopId = payload.shopId;
    state.schedule.restockName = payload.restockName;
    state.schedule.productStoreId = payload.productStoreId
  },
  [types.STOCK_SHOPIFY_SHOPS_UPDATED] (state, payload) {
    state.shopifyShops = payload
  },
  [types.STOCK_JOBS_UPDATED] (state, payload) {
    state.jobs = payload
  }
}
export default mutations;
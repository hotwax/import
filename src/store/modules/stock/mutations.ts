import { MutationTree } from 'vuex'
import StockState from './StockState'
import * as types from './mutation-types'

const mutations: MutationTree <StockState> = {
  [types.STOCK_ITEMS_UPDATED] (state, payload) {
    state.items.parsed = payload.parsed;
    state.items.original = payload.original;
    state.items.unidentifiedItems = payload.unidentifiedItems;
  },
  [types.STOCK_LIST_ITEMS_UPDATED] (state, payload) {
    state.items.parsed = payload;
  },
}
export default mutations;
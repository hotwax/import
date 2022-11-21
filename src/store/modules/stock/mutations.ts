import { MutationTree } from 'vuex'
import StockState from './StockState'
import * as types from './mutation-types'

const mutations: MutationTree <StockState> = {
  [types.ORDER_LIST_UPDATED] (state, payload) {
    state.list.items = payload.items;
    state.list.original = payload.original;
    state.list.unidentifiedProductItems = payload.unidentifiedProductItems;
  },
  [types.ORDER_LIST_ITEMS_UPDATED] (state, payload) {
    state.list.items = payload;
  },
  [types.ORDER_FILE_NAME_UPDATED] (state, payload) {
    state.fileName = payload;
  }
}
export default mutations;
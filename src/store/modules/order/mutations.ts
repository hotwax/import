import { MutationTree } from 'vuex'
import OrderState from './OrderState'
import * as types from './mutation-types'

const mutations: MutationTree <OrderState> = {
  [types.ORDER_LIST_UPDATED] (state, payload) {
    state.purchaseOrders = payload.items
    state.original = payload.original
    state.unidentifiedProductItems = payload.unidentifiedProductItems
  },
  [types.ORDER_LIST_ITEMS_UPDATED] (state, payload) {
    state.purchaseOrders = payload;
  },
  [types.ORDER_FILE_NAME_UPDATED] (state, payload) {
    state.fileName = payload;
  }
}
export default mutations;
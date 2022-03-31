import { MutationTree } from 'vuex'
import OrderState from './OrderState'
import * as types from './mutation-types'

const mutations: MutationTree <OrderState> = {
  [types.ORDER_LIST_UPDATED] (state, payload) {
    state.list.items = payload.items;
    state.list.original = payload.original;
    state.list.unidentifiedProductItems = payload.unidentifiedProductItems;
  },
  [types.ORDER_LIST_ITEMS_UPDATED] (state, payload) {
    state.list.items = payload;
  }
}
export default mutations;
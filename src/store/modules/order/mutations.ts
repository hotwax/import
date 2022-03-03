import { MutationTree } from 'vuex'
import OrderState from './OrderState'
import * as types from './mutation-types'

const mutations: MutationTree <OrderState> = {
  [types.ORDER_LIST_UPDATED] (state, payload) {
    state.list.items = payload.orderItems;
    state.list.original = payload.original;
  },
  [types.ORDER_ITEMS_UPDATED] (state, payload) {
    state.list.items = payload;
  },
  
}
export default mutations;
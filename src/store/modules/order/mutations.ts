import { MutationTree } from 'vuex'
import OrderState from './OrderState'
import * as types from './mutation-types'

const mutations: MutationTree <OrderState> = {
  [types.ORDER_LIST_ORIGINAL] (state, payload) {
    state.order.list.original = payload
  },
  [types.ORDER_LIST_UPDATED] (state, payload) {
    state.order.list = payload;
  },
}
export default mutations;
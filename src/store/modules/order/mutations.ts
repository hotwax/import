import { MutationTree } from 'vuex'
import OrderState from './OrderState'
import * as types from './mutation-types'

const mutations: MutationTree <OrderState> = {
  [types.ORDER_LIST_UPDATED] (state, payload) {
    state.order.originalCsv = payload;
    console.log(payload);
  },
  [types.MODIFY_CSV] (state, payload) {
    state.order.modifiedCsv = payload;
  }
}
export default mutations;
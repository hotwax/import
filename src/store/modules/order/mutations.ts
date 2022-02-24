import { MutationTree } from 'vuex'
import OrderState from './OrderState'
import * as types from './mutation-types'

const mutations: MutationTree <OrderState> = {
  [types.UPLOAD_CSV] (state, payload) {
    state.order.originalCsv = payload;
  }
}
export default mutations;
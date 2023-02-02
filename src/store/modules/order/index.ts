import getters from './getters'
import { Module } from 'vuex'
import actions from './actions'
import mutations from './mutations'
import OrderState from './OrderState'
import RootState from '../../RootState'

const orderModule: Module<OrderState, RootState> = {
  namespaced: true,
  state: {
    purchaseOrders: {
      parsed: {},
      original: {},
      unidentifiedItems: []
    },
    fileName: ""
  },
  actions,
  getters,
  mutations  
}

export default orderModule;
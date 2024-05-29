import getters from './getters'
import { Module } from 'vuex'
import actions from './actions'
import mutations from './mutations'
import StockState from './StockState'
import RootState from '../../RootState'

const orderModule: Module<StockState, RootState> = {
  namespaced: true,
  state: {
    items: {
      parsed: [],
      original: [],
      unidentifiedItems: [],
      initial: []
    },
    fileName: "",
    restockItems: [],
    schedule: {
      scheduledTime: "",
      shopId: "",
      restockName: "" 
    },
    shopifyShops: [],
    jobs: {}
  },
  actions,
  getters,
  mutations  
}

export default orderModule;
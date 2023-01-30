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
    },
    fileName: ""
  },
  actions,
  getters,
  mutations  
}

export default orderModule;
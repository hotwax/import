import getters from './getters'
import { Module } from 'vuex'
import actions from './actions'
import mutations from './mutations'
import OrderState from './OrderState'
import RootState from '../../RootState'

const productModule: Module<OrderState, RootState> = {
    namespaced: true,
    state: {
      order:{
          originalCsv: [],
          modifiedCsv: []
      }
    },
    actions,
    getters,
    mutations
    
}

export default productModule;
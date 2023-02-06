import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import { Module } from 'vuex'
import UserState from './UserState'
import RootState from '@/store/RootState'

const userModule: Module<UserState, RootState> = {
    namespaced: true,
    state: {
      token: '',
      current: null,
      currentFacility: {},
      instanceUrl: '',
      fieldMappings: {
        purchaseOrder: {},
        inventory: {}
      },
      preferredDateTimeFormat: '',
      pwaState: {
        updateExists: false,
        registration: null,
      },
      currentMapping: {
        id: '',
        mappingType: '',
        name: '',
        value: {}
      }
    },
    getters,
    actions,
    mutations,
}

// TODO
// store.registerModule('user', userModule);
export default userModule;
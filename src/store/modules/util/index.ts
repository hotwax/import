import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import { Module } from 'vuex'
import UserState from './UtilState'
import RootState from '@/store/RootState'

const userModule: Module<UserState, RootState> = {
    namespaced: true,
    state: {
      facilities: [],
      facilityLocationsByFacilityId: {},
      goodIdentificationTypes: [],
      isProcessingFile: false,
      productStores: [],
      exactInventoryType: {},
      shipmentItems: [],
      statusDesc: {},
      configDetails: {}
    },
    getters,
    actions,
    mutations,
}

// TODO
// store.registerModule('user', userModule);
export default userModule;
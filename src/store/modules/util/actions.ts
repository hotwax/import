import { UtilService } from '@/services/UtilService'
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import UtilState from './UtilState'
import * as types from './mutation-types'
import { hasError, showToast } from '@/utils'

const actions: ActionTree<UtilState, RootState> = {

  async fetchFacilities({ state, commit}){
    if(state.facilities.length) return;
    const payload = {
      "inputFields": {
        "parentTypeId": "VIRTUAL_FACILITY",
        "parentTypeId_op": "notEqual",
        "facilityTypeId": "VIRTUAL_FACILITY",
        "facilityTypeId_op": "notEqual",
      },
      "fieldList": ["facilityId", "facilityName", "parentTypeId"],
      "viewSize": 50,
      "entityName": "FacilityAndType",
      "noConditionFind": "Y"
    }
    try {
      const resp = await UtilService.getFacilities(payload);
      if(resp.status === 200 && resp.data.docs && !hasError(resp)){
        commit(types.UTIL_FACILITIES_UPDATED, resp.data.docs);
      }
    } catch(err) {
      console.error(err)
    }
  },
}

export default actions;
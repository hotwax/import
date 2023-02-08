import { UtilService } from '@/services/UtilService'
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import UtilState from './UtilState'
import * as types from './mutation-types'
import { hasError } from '@/utils'
import logger from '@/logger'

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
      } else {
        logger.error(resp)
      }
    } catch(err) {
      logger.error(err)
    }
  },
  clearFacilities({commit}){
    commit(types.UTIL_FACILITIES_UPDATED, []);
  },
  async fetchFacilityLocations({ commit, state }, facilityIds){
    facilityIds = facilityIds.filter((facilityId: any) => !state.facilityLocationsByFacilityId[facilityId])
    if(!facilityIds.length) return state.facilityLocationsByFacilityId;

    let resp;
    const params = {
      "inputFields": {
        facilityId: facilityIds,
        "facilityId_op": 'in'
      },
      // Assuming we will not have more than 20 facility locations, hardcoded the viewSize value 20.
      "viewSize": 20,
      "fieldList": ["locationSeqId", "areaId", "aisleId", "sectionId", "levelId", "positionId", "facilityId"],
      "entityName": "FacilityLocation",
      "distinct": "Y",
      "noConditionFind": "Y"
    }
    try {
      resp = await UtilService.getFacilityLocations(params);
      if(resp.status === 200 && !hasError(resp) && resp.data?.count > 0) {
        let facilityLocations = resp.data.docs
        facilityLocations = facilityLocations.reduce((locations: any, location: any) => {
          const locationPath = [location.areaId, location.aisleId, location.sectionId, location.levelId, location.positionId].filter((value: any) => value).join("");
          const facilityLocation = {
            locationSeqId: location.locationSeqId,
            locationPath: locationPath
          }
          locations[location.facilityId] ? locations[location.facilityId].push(facilityLocation) : locations[location.facilityId] = [facilityLocation];
          return locations;
        }, {});
        commit(types.UTIL_FACILITY_LOCATIONS_BY_FACILITY_ID, facilityLocations);
      } else {
        console.error(resp);
      }
    } catch(err) {
      console.error(err);
    }
    return state.facilityLocationsByFacilityId;
  },
}


export default actions;
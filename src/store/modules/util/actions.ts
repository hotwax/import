import { UtilService } from '@/services/UtilService'
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import UtilState from './UtilState'
import * as types from './mutation-types'
import { hasError } from '@/utils'
import logger from '@/logger'

const actions: ActionTree<UtilState, RootState> = {

  async fetchFacilities({ state, commit}){
    if(state.facilities.length) return state.facilities;
    const payload = {
      "inputFields": {
        "parentTypeId": "VIRTUAL_FACILITY",
        "parentTypeId_op": "notEqual",
        "facilityTypeId": "VIRTUAL_FACILITY",
        "facilityTypeId_op": "notEqual",
      },
      "fieldList": ["facilityId", "facilityName", "parentTypeId", "externalId"],
      "viewSize": 50,
      "entityName": "FacilityAndType",
      "noConditionFind": "Y"
    }
    try {
      const resp = await UtilService.getFacilities(payload);
      if(resp.status === 200 && !hasError(resp)){
        commit(types.UTIL_FACILITIES_UPDATED, resp.data.docs);
      } else {
        logger.error(resp)
        commit(types.UTIL_FACILITIES_UPDATED, []);
      }
    } catch(err) {
      logger.error(err)
      commit(types.UTIL_FACILITIES_UPDATED, []);
    }
    return state.facilities;
  },
  clearFacilities({commit}){
    commit(types.UTIL_FACILITIES_UPDATED, []);
  },
  async fetchFacilityLocations({ commit, state }, facilityIds){
    const unavailablefacilityIds = facilityIds.filter((facilityId: any) => !state.facilityLocationsByFacilityId[facilityId])

    // We already have required facility locations in cache
    if(!unavailablefacilityIds.length) return state.facilityLocationsByFacilityId;

    let resp;
    const params = {
      "inputFields": {
        facilityId: unavailablefacilityIds,
        "facilityId_op": 'in'
      },
      // setting highest viewSize that performFind can fetch.
      "viewSize": 250,
      "fieldList": ["locationSeqId", "areaId", "aisleId", "sectionId", "levelId", "positionId", "facilityId"],
      "entityName": "FacilityLocation",
      "distinct": "Y",
      "noConditionFind": "Y"
    }
    try {
      resp = await UtilService.getFacilityLocations(params);
      if(resp.status === 200 && !hasError(resp)) {
        const facilityLocations = resp.data.docs
        const facilityLocationsByFacilityId = facilityLocations.reduce((locations: any, location: any) => {
          const locationPath = [location.areaId, location.aisleId, location.sectionId, location.levelId, location.positionId].filter((value: any) => value).join("");
          const facilityLocation = {
            locationSeqId: location.locationSeqId,
            locationPath: locationPath
          }
          locations[location.facilityId] ? locations[location.facilityId].push(facilityLocation) : locations[location.facilityId] = [facilityLocation];
          return locations;
        }, {});
        commit(types.UTIL_FACILITY_LOCATIONS_BY_FACILITY_ID, facilityLocationsByFacilityId);
      } else {
        logger.error(resp.data)
      }
    } catch(err) {
      logger.error(err);
    }
    return state.facilityLocationsByFacilityId;
  },

  async fetchGoodIdentificationTypes({ state, commit }) {
    if (state.goodIdentificationTypes.length) return state.goodIdentificationTypes;
    
    const payload = {
      "inputFields": {
        "parentTypeId": "HC_GOOD_ID_TYPE",
      },
      "fieldList": ["goodIdentificationTypeId", "description"],
      "viewSize": 50,
      "entityName": "GoodIdentificationType",
      "noConditionFind": "Y"
    }
    try {
      const resp = await UtilService.fetchGoodIdentificationTypes(payload);
      if (!hasError(resp) && resp.data.count > 0) {
        commit(types.UTIL_GOOD_IDENTIFICATION_TYPES_UPDATED, resp.data.docs);
      } else {
        throw resp.data;
      }
    } catch (err) {
      logger.error(err)
    }
    return state.facilities;
  },
  async updateFileProcessingStatus({ commit }, status){
    commit(types.UTIL_FILE_PROCESSING_STATUS_UPDATED, { status });
  },
}


export default actions;
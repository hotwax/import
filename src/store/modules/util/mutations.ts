import { MutationTree } from 'vuex'
import UtilState from './UtilState'
import * as types from './mutation-types'

const mutations: MutationTree <UtilState> = {
    [types.UTIL_FACILITIES_UPDATED] (state, payload) {
        state.facilities = payload
    },
    [types.UTIL_FACILITY_LOCATIONS_BY_FACILITY_ID] (state, facilityLocations) {
        Object.keys(facilityLocations).map((facilityId: any) => {
            state.facilityLocationsByFacilityId[facilityId] = facilityLocations[facilityId];
        })
    },
    [types.UTIL_GOOD_IDENTIFICATION_TYPES_UPDATED](state, payload) {
        state.goodIdentificationTypes = payload
    },
    [types.UTIL_FILE_PROCESSING_STATUS_UPDATED] (state, payload) {
        state.isProcessingFile = payload.status;
    },
    [types.UTIL_PRODUCT_STORES_UPDATED] (state, payload) {
        state.productStores = payload;
    },
    [types.UTIL_EXACT_INVENTORY_TYPE_UPDATED] (state, payload) {
        state.exactInventoryType = payload;
    },
    [types.UTIL_SHIPMENT_ITEMS_UPDATED] (state, payload) {
        state.shipmentItems = payload;
    },
    [types.UTIL_SERVICE_STATUS_DESC_UPDATED] (state, payload) {
        state.statusDesc = payload
    },
    [types.UTIL_DATA_MANAGER_CONFIG_UPDATED] (state, payload) {
        state.configDetails = payload;
    },
    [types.PRODUCT_SELECTOR_PREF_UPDATED](state, payload) {
        state.productSelectorPref = payload
    },
    [types.PRODUCT_STORE_SELECTOR_UPDATED](state, payload) {
        state.useDefaultProductStoreIdentifier = payload
    }
}
export default mutations;
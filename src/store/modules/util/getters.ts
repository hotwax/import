import { GetterTree } from 'vuex'
import UtilState from './UtilState'
import RootState from '@/store/RootState'

const getters: GetterTree <UtilState, RootState> = {
    getFacilities (state) {
        return state.facilities;
    },
    getFacilityLocationsByFacilityId: (state) => (facilityId: string) => {
        return state.facilityLocationsByFacilityId[facilityId]
    },
    getGoodIdentificationTypes(state) {
        return state.goodIdentificationTypes;
    },
    getFileProcessingStatus(state) {
        return state.isProcessingFile;
    },
    getProductStores(state) {
        return state.productStores;
    },
    getExactInventoryType(state) {
        return state.exactInventoryType
    },
    getShipmentItems(state) {
        return state.shipmentItems;
    },
    getStatusDesc: (state) => (statusId: any) => {
        return state.statusDesc[statusId] ? state.statusDesc[statusId] : "-";
    },
    getDataManagerConfig(state) {
        return state.configDetails
    }
}
export default getters;
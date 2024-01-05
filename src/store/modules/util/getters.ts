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
    }
}
export default getters;
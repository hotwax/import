import { GetterTree } from 'vuex'
import UserState from './UserState'
import RootState from '@/store/RootState'

const getters: GetterTree <UserState, RootState> = {
    isAuthenticated (state) {
        return !!state.token;
    },
    isUserAuthenticated(state) {
        return state.token && state.current
    },
    getUserToken (state) {
        return state.token
    },
    getUserProfile (state) {
        return state.current
    },
    getCurrentFacility (state){
        return state.currentFacility;
    },
    getInstanceUrl (state) {
        const baseUrl = process.env.VUE_APP_BASE_URL;
        return baseUrl ? baseUrl : state.instanceUrl;
    },
    getFieldMappings(state) {
        return state.fieldMappings;
    },
    getPreferredDateTimeFormat (state) {
        return state.preferredDateTimeFormat;  
    },
    getFacilityLocationsByFacilityId: (state) => (facilityId: string) => {
        return state.facilityLocationsByFacilityId[facilityId]
    },    
    getCurrentMapping(state) {
        return JSON.parse(JSON.stringify(state.currentMapping))
    }
}
export default getters;
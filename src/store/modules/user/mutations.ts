import { MutationTree } from 'vuex'
import UserState from './UserState'
import * as types from './mutation-types'

const mutations: MutationTree <UserState> = {
    [types.USER_TOKEN_CHANGED] (state, payload) {
        state.token = payload.newToken
    },
    [types.USER_END_SESSION] (state) {
      state.token = ''
      state.current = null
      state.currentFacility = {}
    },
    [types.USER_INFO_UPDATED] (state, payload) {
        state.current = payload
    },
    [types.USER_CURRENT_FACILITY_UPDATED] (state, payload) {
        state.currentFacility = payload;
    },
    [types.USER_INSTANCE_URL_UPDATED] (state, payload) {
        state.instanceUrl = payload;
    },
    [types.USER_FIELD_MAPPING_UPDATED] (state, payload) {
        if(payload.id) {
            (state.fieldMappings as any)[payload.id] = {
                name: payload.name,
                value: payload.value
            };
        } else {
            state.fieldMappings = payload;
        }
    },
    [types.USER_FIELD_MAPPING_DELETED] (state, id) {
        delete (state.fieldMappings as any)[id];
    },
    [types.USER_DATETIME_FORMAT_UPDATED] (state, payload) {
        state.preferredDateTimeFormat = payload;
    },
    [types.USER_CURRENT_FIELD_MAPPING_UPDATED] (state, payload) {
        state.currentMapping = payload
    },
    [types.USER_FIELD_MAPPING_CREATED] (state, payload) {
        (state.fieldMappings as any)[payload.id] = {
            name: payload.name,
            value: payload.value
        };
    }
}
export default mutations;
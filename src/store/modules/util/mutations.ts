import { MutationTree } from 'vuex'
import UtilState from './UtilState'
import * as types from './mutation-types'

const mutations: MutationTree <UtilState> = {
    [types.UTIL_FACILITIES_UPDATED] (state, payload) {
        state.facilities = payload
    },
}
export default mutations;
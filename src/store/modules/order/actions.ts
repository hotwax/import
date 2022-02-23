import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import OrderState from './OrderState'
import * as types from './mutation-types'

const actions: ActionTree<OrderState, RootState> = {
  uploadCsv({commit}, payload){
      commit(types.UPLOAD_CSV,  payload );
  }
}    
export default actions;
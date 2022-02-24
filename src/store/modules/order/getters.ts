import { GetterTree } from "vuex";
import OrderState from "./OrderState";
import RootState from "../../RootState";

const getters: GetterTree<OrderState, RootState> = {
  getCsv(state){
    return state.order.originalCsv;
  }
};
export default getters;   
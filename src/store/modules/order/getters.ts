import { GetterTree } from "vuex";
import OrderState from "./OrderState";
import RootState from "../../RootState";

const getters: GetterTree<OrderState, RootState> = {
  getOrdeItems(state){
    return state.order.originalCsv;
  },
  getGroupedProducts(state){
    return state.order.grouped;
  }
};
export default getters;   
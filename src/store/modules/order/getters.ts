import { GetterTree } from "vuex";
import OrderState from "./OrderState";
import RootState from "../../RootState";

const getters: GetterTree<OrderState, RootState> = {
  getOrderItems(state){
    return state.order.list.original;
  },
  
};
export default getters;   
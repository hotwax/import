import { GetterTree } from "vuex";
import OrderState from "./OrderState";
import RootState from "../../RootState";

const getters: GetterTree<OrderState, RootState> = {
  getPurchaseOrders(state) {
    return state.purchaseOrders;
  },
  getFileName(state) {
    return state.fileName;
  }
};
export default getters;   
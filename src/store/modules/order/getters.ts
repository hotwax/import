import { GetterTree } from "vuex";
import OrderState from "./OrderState";
import RootState from "../../RootState";

const getters: GetterTree<OrderState, RootState> = {
  getOrder(state) {
    return state.purchaseOrders;
  },
  getOriginalItems(state) {
    return state.original;
  },
  getUnidentifiedProductItems(state) {
    return state.unidentifiedProductItems;
  },
  getFileName(state) {
    return state.fileName;
  },
  getCompletedItems(state) {
    return state.completedItems;
  }
};
export default getters;   
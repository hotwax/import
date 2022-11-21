import { GetterTree } from "vuex";
import OrderState from "./StockState";
import RootState from "../../RootState";

const getters: GetterTree<OrderState, RootState> = {
  getOrder(state) {
    return state.list;
  },
  getFileName(state) {
    return state.fileName;
  }
};
export default getters;   
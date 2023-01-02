import { GetterTree } from "vuex";
import OrderState from "./StockState";
import RootState from "../../RootState";

const getters: GetterTree<OrderState, RootState> = {
  getStock(state) {
    return state.list;
  },
};
export default getters;   
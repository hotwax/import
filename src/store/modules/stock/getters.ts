import { GetterTree } from "vuex";
import OrderState from "./StockState";
import RootState from "../../RootState";

const getters: GetterTree<OrderState, RootState> = {
  getItemsStock(state) {
    return JSON.parse(JSON.stringify(state.items));
  },
};
export default getters;   
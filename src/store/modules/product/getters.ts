import { GetterTree } from "vuex";
import ProductState from "./ProductState";
import RootState from "../../RootState";

const getters: GetterTree<ProductState, RootState> = {
  getProduct: (state) => (productId: string) => {
    // Returning empty object so that it doesn't breaks the UI
    return state.cached[productId] ? state.cached[productId] : {};
  },
  getProductById: (state) => (productId: string) => {
    return state.productById[productId] ? state.productById[productId] : {};
  },
  getProducts: (state) => {
    return state.list.items
  },
  isScrollable(state) {
    return (
      state.list.items.length > 0 &&
      state.list.items.length < state.list.total
    );
  },
  isProductAvailableInShipment: (state, getters, rootState, rootGetters) => (productId: string) => {
    return rootGetters['util/getShipmentItems'].some((item: any) => item.productId === productId);
  },
};
export default getters;
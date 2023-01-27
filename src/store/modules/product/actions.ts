import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import ProductState from './ProductState'
import * as types from './mutation-types'
import { fetchProducts, isError } from "@/adapter";

const actions: ActionTree<ProductState, RootState> = {

  async fetchProducts ( { commit, state }, { productIds }) {
    const cachedProductIds = Object.keys(state.cached);
    const productIdFilter= productIds.reduce((filter: Array<any>, productId: any) => {
      // If product does not exist in cached products then add the id
      if (!cachedProductIds.includes(productId) && productId) {
        filter.push(productId);
      }
      return filter;
    }, []);

    // If there are no product ids to search skip the API call
    if (productIdFilter.length == 0) return productIds.map((productId: any) => state.cached[productId]).filter((product: any) => product);

    const resp = await fetchProducts({
      filters: { 'internalName': { 'value': productIdFilter }},
      viewSize: productIdFilter.length,
      viewIndex: 0
    })

    if (!isError(resp)) {
      const products = resp.products;
      // Handled empty response in case of failed query
      if (resp.total) commit(types.PRODUCT_ADD_TO_CACHED_MULTIPLE, { products });
      return resp.products;
    } else {
      console.error(resp.serverResponse)
    }
    // TODO Handle specific error
    return [];
  },
}

export default actions;

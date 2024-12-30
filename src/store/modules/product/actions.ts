import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import ProductState from './ProductState'
import * as types from './mutation-types'
import { fetchProducts, isError } from "@/adapter";
import logger from "@/logger";
import emitter from "@/event-bus";
import { hasError } from "@/utils";
import { UtilService } from '@/services/UtilService'

const actions: ActionTree<ProductState, RootState> = {

  async fetchProducts ( { commit, state }, { productIds, identificationTypeId }) {

    // TODO Add try-catch block

    const cachedProductIds = Object.keys(state.cached);
    const productIdFilter= productIds.reduce((filter: Array<any>, productId: any) => {
      // If product does not exist in cached products then add the id
      if (!cachedProductIds.includes(productId) && productId) {
        filter.push(productId);
      }
      return filter;
    }, []);

    // If there are no product ids to search skip the API call
    if (productIdFilter.length == 0) return state.cached;
    
    const modifiedProductIdFilters = productIdFilter.map((productId: string) => identificationTypeId + '/' + productId);
    const resp = await fetchProducts({
      filters: { 'goodIdentifications': { 'value': modifiedProductIdFilters }},
      viewSize: productIdFilter.length,
      viewIndex: 0
    })

    if (!isError(resp)) {
      const products = resp.products;
      // Handled empty response in case of failed query
      if (resp.total) commit(types.PRODUCT_ADD_TO_CACHED_MULTIPLE, { products });
    } else {
      logger.error(resp.serverResponse)
    }
    // TODO Handle specific error
    return state.cached;
  },
  async findProduct({ commit, state }, payload) {
    let resp;
    if (payload.viewIndex === 0) emitter.emit("presentLoader");
    try {
      resp = await UtilService.fetchProducts({
        "keyword": payload.queryString,
        "viewSize": payload.viewSize,
        "viewIndex": payload.viewIndex
      })
      if (!hasError(resp)) {
        let products = resp.data.response.docs;
        const total = resp.data.response.numFound;

        if (payload.viewIndex && payload.viewIndex > 0) products = state.list.items.concat(products)
        commit(types.PRODUCT_LIST_UPDATED, { products, total });
        commit(types.PRODUCT_ADD_TO_CACHED_MULTIPLE, { products });
      } else {
        throw resp.data.docs;
      }
    } catch (error) {
      commit(types.PRODUCT_LIST_UPDATED, { products: [], total: 0 });
    } finally {
      if (payload.viewIndex === 0) emitter.emit("dismissLoader");
    }
    
    return resp;
  },
  async clearProducts({ commit }) {
    commit(types.PRODUCT_LIST_UPDATED, { products: [], total: 0 });
  },
}

export default actions;

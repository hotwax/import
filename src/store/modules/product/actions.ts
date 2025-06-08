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

  async fetchProducts ( { commit, state }, { productIdentificationIds, identificationTypeId }) {

    const productIdentificationFilter = productIdentificationIds.reduce((filter: Array<any>, productIdentificationId: any) => {
      if(!productIdentificationId) return filter;

      // Check if this productIdentificationId exists in any cached product's identifications
      const productExistsInCache = Object.values(state.cached).some((cachedProduct: any) => {
        return cachedProduct.identifications?.some((identification: any) => 
          identification.productIdTypeEnumId.toLowerCase() === identificationTypeId.toLowerCase() && identification.idValue === productIdentificationId);
      });

      // If product does not exist in cached products then add the id
      if(!productExistsInCache) filter.push(productIdentificationId);
      return filter;
    }, []);

    // If there are no product to search skip the API call
    if (productIdentificationFilter.length == 0) return state.cached;
    
    const modifiedProductIdentificationFilters = productIdentificationFilter.map((productIdentificationId: string) => identificationTypeId + '/' + productIdentificationId);
    let products = [] as any, viewIndex = 0, resp;
    try {
      do {
        resp = await fetchProducts({
          filters: { 'goodIdentifications': { 'value': modifiedProductIdentificationFilters }},
          viewSize: productIdentificationFilter.length,
          viewIndex
        })
    
        if (!isError(resp) && resp.total > 0) {
          products = products.concat(resp.products);
          commit(types.PRODUCT_ADD_TO_CACHED_MULTIPLE, { products });
          viewIndex += resp.products.length;
        } else {
          logger.error(resp.serverResponse)
        }
      } while(resp.total > products.length);
    } catch (error) {
      logger.error(error);
    }
    return state.cached;
  },
  async findProduct({ commit, state }, payload) {
    let resp;
    if(payload.viewIndex === 0) emitter.emit("presentLoader");
    try {
      resp = await UtilService.fetchProducts({
        "keyword": payload.queryString,
        "viewSize": payload.viewSize,
        "viewIndex": payload.viewIndex
      })
      if(!hasError(resp)) {
        let products = resp.data.response.docs;
        const total = resp.data.response.numFound;

        if(payload.viewIndex && payload.viewIndex > 0) products = state.list.items.concat(products)
        commit(types.PRODUCT_LIST_UPDATED, { products, total });
        commit(types.PRODUCT_ADD_TO_CACHED_MULTIPLE, { products });
      } else {
        throw resp.data.docs;
      }
    } catch(error) {
      commit(types.PRODUCT_LIST_UPDATED, { products: [], total: 0 });
    }
    
    if(payload.viewIndex === 0) emitter.emit("dismissLoader");
    return resp;
  },
  async clearProducts({ commit }) {
    commit(types.PRODUCT_LIST_UPDATED, { products: [], total: 0 });
  },
}

export default actions;

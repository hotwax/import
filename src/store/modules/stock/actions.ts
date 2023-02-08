import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import StockState from './StockState'
import * as types from './mutation-types'

const actions: ActionTree<StockState, RootState> = {
  async updatedStockList ({commit, rootGetters}, items) {
    const productIds = items.map((item: any) => item.shopifyProductSKU)
    const facilityIds = [...new Set(items.map((item: any) => item.externalFacilityId))]
    const viewSize = productIds.length;
    const viewIndex = 0;
    const payload = {
      viewSize,
      viewIndex,
      productIds
    }
    await store.dispatch('user/fetchFacilityLocations', facilityIds);
    await store.dispatch("product/fetchProducts", payload);
    const unidentifiedItems = [] as any;
    const parsed = items.map((item: any) => {
      const product = rootGetters['product/getProduct'](item.shopifyProductSKU)
      
      if(Object.keys(product).length > 0){
        item.parentProductId = product?.parent?.id;
        item.pseudoId = product.pseudoId;
        item.parentProductName = product?.parent?.productName;
        item.imageUrl = product.images?.mainImageUrl;
        item.isSelected = true;
        return item;
      }
      unidentifiedItems.push(item);
      return;
    }).filter((item: any) => item);

    const original = JSON.parse(JSON.stringify(parsed));

    commit(types.STOCK_ITEMS_UPDATED, { parsed, original, unidentifiedItems });
  },
  updateStockItems({ commit }, stockItems){
    commit(types.STOCK_ITEMS_UPDATED, stockItems);
  },
  clearStockList({ commit }){
    commit(types.STOCK_ITEMS_UPDATED, { parsed: [], original: [], unidentifiedItems: []});
  },
  updateUnidentifiedItem({ commit, state }, payload: any) {
    const parsed = state.items.parsed as any;
    const unidentifiedItems = payload.unidentifiedItems.map((item: any) => {
      if(item.updatedSku) {
        item.shopifyProductSKU = item.updatedSku;
        parsed.push(item);
        state.items.original.push(item);
      } else {
        return item;
      }
    }).filter((item: any) => item);

    const original = JSON.parse(JSON.stringify(state.items.original));

    commit(types.STOCK_ITEMS_UPDATED, { parsed, original, unidentifiedItems});
  },
  async updateMissingFacilities({ state }, facilityMapping){
    const facilityLocations = await this.dispatch('user/fetchFacilityLocations', Object.values(facilityMapping));
    Object.keys(facilityMapping).map((facilityId: any) => {
      const locationSeqId = facilityLocations[facilityMapping[facilityId]].length ? facilityLocations[facilityMapping[facilityId]][0].locationSeqId : '';
      state.items.parsed.map((item: any) => {
        if(item.externalFacilityId === facilityId){
          item.externalFacilityId = "";
          item.facilityId = facilityMapping[facilityId];
          item.locationSeqId = locationSeqId;
        }
      })
    })
    this.dispatch('stock/updateStockItems', state.items);
  }
}
export default actions;
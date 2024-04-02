import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import StockState from './StockState'
import * as types from './mutation-types'

const actions: ActionTree<StockState, RootState> = {
  async processUpdateStockItems ({ commit, rootGetters }, items) {
    this.dispatch('util/updateFileProcessingStatus', true);

    //Fetching only top 
    const productIds = items.slice(0, process.env['VUE_APP_VIEW_SIZE']).map((item: any) => item.identification);


    // We are getting external facilityId from CSV, extract facilityId and pass for getting locations
    const externalFacilityIds = [...new Set(items.map((item: any) => item.externalFacilityId))]
    const facilities = await store.dispatch('util/fetchFacilities');
    const facilityMapping = facilities.reduce((facilityMapping: any, facility: any) => {
      if (facility.externalId) facilityMapping[facility.externalId] = facility.facilityId;
      return facilityMapping;
    }, {})
    const facilityIds = externalFacilityIds.map((externalFacilityId: any) => {
      return facilityMapping[externalFacilityId];
    }).filter((facilityId: any) => facilityId)
    store.dispatch('util/fetchFacilityLocations', facilityIds);
    

    const viewSize = productIds.length;
    const viewIndex = 0;
    const payload = {
      viewSize,
      viewIndex,
      productIds,
      identificationTypeId: items[0]?.identificationTypeId //fetching identificationTypeId from first item, as all the items will have one identification type
    }
    const cachedProducts = await store.dispatch("product/fetchProducts", payload);
    const parsed = [] as any;
    const initial = items.map((item: any) => {
      const product = cachedProducts[item.identification];
      const facilityLocation = rootGetters['util/getFacilityLocationsByFacilityId'](item.externalFacilityId)?.[0];
      item.locationSeqId = facilityLocation?.locationSeqId;
      parsed.push(item);
      
      if (product) {
        item.parentProductId = product?.parent?.id;
        item.pseudoId = product.pseudoId;
        item.parentProductName = product?.parent?.productName;
        item.imageUrl = product.images?.mainImageUrl;
        item.isSelected = true;
        return item;
      }
      return;
    }).filter((item: any) => item);

    const original = JSON.parse(JSON.stringify(items));

    commit(types.STOCK_ITEMS_UPDATED, { parsed, original, initial });
    this.dispatch('util/updateFileProcessingStatus', false);
  },
  updateStockItems({ commit }, stockItems){
    commit(types.STOCK_ITEMS_UPDATED, stockItems);
  },
  clearStockItems({ commit }){
    commit(types.STOCK_ITEMS_UPDATED, { parsed: [], original: []});
  },
  async updateMissingFacilities({ state }, facilityMapping){
    const facilityLocations = await this.dispatch('util/fetchFacilityLocations', Object.values(facilityMapping));
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

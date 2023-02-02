import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import OrderState from './OrderState'
import * as types from './mutation-types'


const actions: ActionTree<OrderState, RootState> = {
  async fetchOrderDetails ({commit, rootGetters}, items) {
    const productIds = items.filter((item: any) =>  item.shopifyProductSKU).map((item: any) => {
      return item.shopifyProductSKU
    })
    const viewSize = productIds.length;
    const viewIndex = 0;
    const payload = {
      viewSize,
      viewIndex,
      productIds
    }
    await store.dispatch("product/fetchProducts", payload);
    const unidentifiedItems = [] as any;

    items = items.filter((item: any) =>  item.shopifyProductSKU).map((item: any) => {
      const product = rootGetters['product/getProduct'](item.shopifyProductSKU)

      if(Object.keys(product).length > 0){
        item.parentProductId = product?.parent?.id;
        item.pseudoId = product.pseudoId;
        item.parentProductName = product?.parent?.productName;
        item.imageUrl = product.images?.mainImageUrl;
        item.isNewProduct = "N";
        item.isSelected = true;
        return item;
      }
      unidentifiedItems.push(item);
      return ;
    }).filter((item: any) => item);

    
    items = items.reduce((itemsByPoId: any, item: any) => {
      itemsByPoId[item.orderId] ? itemsByPoId[item.orderId].push(item) : itemsByPoId[item.orderId] = [item] 
      return itemsByPoId;
    }, {});

    const original = JSON.parse(JSON.stringify(items));
    
    commit(types.ORDER_PURCHASEORDERS_UPDATED, {items, original, unidentifiedItems});
  },
  updatePurchaseOrderItems({ commit }, purchaseOrders){
    commit(types.ORDER_PURCHASEORDERS_ITEMS_UPDATED, purchaseOrders)
  },
  updateFileName({ commit }, fileName){
    commit(types.ORDER_FILE_NAME_UPDATED, fileName)
  },  
  clearPurchaseOrders({ commit }){
    commit(types.ORDER_PURCHASEORDERS_UPDATED, { items: [], original: [], unidentifiedItems: []});
  },
  updateUnidentifiedItem({ commit, state }, payload: any) {
    const items = state.purchaseOrders.parsed as any;
    const unidentifiedItems = payload.unidentifiedItems.map((item: any) => {
      if(item.updatedSku) {
        item.shopifyProductSKU = item.updatedSku;
        items[item.orderId].push(item);
      } else {
        return item;
      }
    }).filter((item: any) => item);
    const original = JSON.parse(JSON.stringify(state.purchaseOrders.parsed));

    commit(types.ORDER_PURCHASEORDERS_UPDATED, { items, original, unidentifiedItems});
  }
}
export default actions;

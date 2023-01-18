import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import OrderState from './OrderState'
import * as types from './mutation-types'


const actions: ActionTree<OrderState, RootState> = {
  async updatedOrderList ({commit, rootGetters, state}, items) {
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
    const unidentifiedProductItems = [] as any;

    items = items.filter((item: any) =>  item.shopifyProductSKU).map((item: any) => {
      const product = rootGetters['product/getProduct'](item.shopifyProductSKU)

      if(Object.keys(product).length > 0){
        item.parentProductId = product.groupId;
        item.internalName = product.internalName;
        item.parentProductName = product.parentProductName;
        item.imageUrl = product.mainImageUrl;
        item.isNewProduct = "N";
        item.isSelected = true;
        return item;
      }
      unidentifiedProductItems.push(item);
      return ;
    }).filter((item: any) => item);

    const original = JSON.parse(JSON.stringify(items));
    
    items = items.reduce((itemsByPoId: any, item: any) => {
      itemsByPoId[item.orderId] ? itemsByPoId[item.orderId].push(item) : itemsByPoId[item.orderId] = [item] 
      return itemsByPoId;
    }, {});
    
    commit(types.ORDER_LIST_UPDATED, {items, original, unidentifiedProductItems});
  },
  updatedOrderListItems({ commit }, orderListItems){
    commit(types.ORDER_LIST_ITEMS_UPDATED, orderListItems)
  },
  updateFileName({ commit }, fileName){
    commit(types.ORDER_FILE_NAME_UPDATED, fileName)
  },  
  clearOrderList({ commit }){
    commit(types.ORDER_LIST_UPDATED, { items: [], original: [], unidentifiedProductItems: []});
  },
  updateMissingSkusList({ commit, state }, payload: any) {
    const original = JSON.parse(JSON.stringify(state.original.concat(payload.completedItems)));

    const items = payload.completedItems.reduce((itemsByPoId: any, item: any) => {
      itemsByPoId[item.orderId] ? itemsByPoId[item.orderId].push(item) : itemsByPoId[item.orderId] = [item] 
      return itemsByPoId;
    }, state.purchaseOrders);
    
    commit(types.ORDER_LIST_UPDATED, { items, original, unidentifiedProductItems: payload.unidentifiedProductItems});
  }
}
export default actions;

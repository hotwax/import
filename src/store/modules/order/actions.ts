import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import OrderState from './OrderState'
import * as types from './mutation-types'
import { DateTime } from 'luxon';


const actions: ActionTree<OrderState, RootState> = {
  async updatedOrderList ({state, commit, rootGetters}, items) {
    const productIds = items.map((item: any) => {
      return item.shopifyProductSKU
    }).filter((id: string) => id);
    const viewSize = productIds.length;
    const viewIndex = 0;
    const payload = {
      viewSize,
      viewIndex,
      productIds
    }
    await store.dispatch("product/fetchProducts", payload);
    const unidentifiedProductItems = [] as any;
    const productItemsWithMissingInfo = [] as any;
    items = items.map((item: any) => {
      if(item.shopifyProductSKU){
        const product = rootGetters['product/getProduct'](item.shopifyProductSKU)
        if(Object.keys(product).length > 0){
          item.parentProductId = product.groupId;
          item.internalName = product.internalName;
          item.parentProductName = product.parentProductName;
          item.imageUrl = product.mainImageUrl;
          item.isNewProduct = "N";
          item.isSelected = true;
          if((Object.keys(item).length - 1) === Object.values(item).filter((value: any) => value).length) return item;
          else productItemsWithMissingInfo.push(item); 
          return;
        }
        if((Object.keys(item).length - 1) === Object.values(item).filter((value: any) => value).length) unidentifiedProductItems.push(item);
        else productItemsWithMissingInfo.push(item);
        return ;
      } else {
        productItemsWithMissingInfo.push(item);
      }
    }).filter((item: any) => item);
    
    const original = JSON.parse(JSON.stringify(items))

    commit(types.ORDER_LIST_UPDATED, { items, original, unidentifiedProductItems, productItemsWithMissingInfo});
  },
  updatedOrderListItems({ commit }, orderListItems){
    commit(types.ORDER_LIST_ITEMS_UPDATED, orderListItems)
  },
  updateFileName({ commit }, fileName){
    commit(types.ORDER_FILE_NAME_UPDATED, fileName)
  },  
  clearOrderList({ commit }){
    commit(types.ORDER_LIST_UPDATED, { items: [], original: [], unidentifiedProductItems: [], productItemsWithMissingInfo: []});
  }
}
export default actions;

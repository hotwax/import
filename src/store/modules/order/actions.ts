import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import OrderState from './OrderState'
import * as types from './mutation-types'
import router from '@/router'
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
          item.arrivalDate = DateTime.fromFormat(item.arrivalDate, "D").toFormat(process.env.VUE_APP_DATE_FORMAT ? process.env.VUE_APP_DATE_FORMAT : 'MM/dd/yyyy');
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
  clearOrderList({ commit }){
    commit(types.ORDER_LIST_UPDATED, { items: [], original: [], unidentifiedProductItems: [], productItemsWithMissingInfo: []});
  }
}
export default actions;

import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import OrderState from './OrderState'
import * as types from './mutation-types'
import router from '@/router'
import { DateTime } from 'luxon';


const actions: ActionTree<OrderState, RootState> = {
  async updatedOrderList ({commit}, items) {
    const productIds = items.map((item: any) => {
      return item.shopifyProductSKU
    })
    const viewSize = productIds.length;
    const viewIndex = 0;
    const payload = {
      viewSize,
      viewIndex,
      productIds
    }
    const products = await store.dispatch("product/fetchProducts", payload);
    items = items.map((item: any) => {
        const product = products.find((product: any) => {
          return item.shopifyProductSKU == product.internalName;
        })
        item.arrivalDate = DateTime.fromFormat(item.arrivalDate, "D").toFormat(process.env.VUE_APP_DATE_FORMAT ? process.env.VUE_APP_DATE_FORMAT : 'MM/dd/yyyy' );
        item.parentProductId = product.groupId;
        item.internalName = product.internalName; 
        item.parentProductName = product.parentProductName;
        item.imageUrl = product.mainImageUrl;
        item.isNewProduct = "N";
        item.isSelected = true;
        return item;
    })
    const original = JSON.parse(JSON.stringify(items))
    commit(types.ORDER_LIST_UPDATED, { items, original });
  },
  updatedOrderListItems({ commit }, orderListItems){
    commit(types.ORDER_LIST_ITEMS_UPDATED, orderListItems)
  },
}
export default actions;

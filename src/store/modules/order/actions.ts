import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import OrderState from './OrderState'
import * as types from './mutation-types'
import router from '@/router'


const actions: ActionTree<OrderState, RootState> = {
  async updatedOrderList ({commit}, orderItems) {
    const productIds = orderItems.map((item: any) => {
      return item.shopifyProductSKU
    })
    const viewSize = productIds.length;
    const viewIndex = 0;
    const payload = {
      viewSize,
      viewIndex,
      productIds
    }
    const resp = await store.dispatch("product/fetchProducts", payload);
    orderItems = orderItems.map((item: any) => {
        const product = resp.data.response.docs.find((product: any) => {
          return item.shopifyProductSKU == product.internalName;
        })
        item.parentProductId = product.groupId;
        item.internalName = product.internalName; 
        item.parentProductName = product.parentProductName;
        item.imageUrl = product.mainImageUrl;
        item.isNewProduct = false;
        return item;
    })
    const original = JSON.parse(JSON.stringify(orderItems))
    commit(types.ORDER_LIST_UPDATED, { orderItems: orderItems, original: original });
  }
}
export default actions;
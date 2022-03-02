import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import OrderState from './OrderState'
import * as types from './mutation-types'
import router from '@/router'


const actions: ActionTree<OrderState, RootState> = {
  orderListOriginal ({ commit }, payload) {
    commit(types.ORDER_LIST_ORIGINAL,  payload );
  },
  async groupProducts ({commit}, orderItems: any) {
    const productIds = orderItems.map((item: any) => {
      return item.shopifyproductSKU
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
          if(item.shopifyproductSKU == product.internalName)
          return product;
        })
        item.parentProductId = product.groupId;
        item.internalName = product.internalName; 
        item.parentProductName = product.parentProductName;
        item.imageUrl = product.mainImageUrl;
        item.isNewProduct = false;
        return item;
    })
    await store.dispatch('order/orderListOriginal', orderItems);
    router.push({
      name:'Purchase Order Detail'
    })
  }
}   
export default actions;
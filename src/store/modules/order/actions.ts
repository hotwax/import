import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import OrderState from './OrderState'
import * as types from './mutation-types'
import router from '@/router'


const actions: ActionTree<OrderState, RootState> = {
  updateOrderList ({ commit }, payload) {
    commit(types.ORDER_LIST_UPDATED,  payload );
  },
  modifyCsv ({ commit }, payload) {
    commit(types.MODIFY_CSV, payload);
  },
  async groupProducts ({commit}, csv: any) {
    const productIds = csv.map((item: any) => {
      return item.shopifyproductSKU
    })
    const viewSize = process.env.VUE_APP_VIEW_SIZE;
    const viewIndex = 0;
    const payload = {
      viewSize,
      viewIndex,
      productIds
    }
    const resp = await store.dispatch("product/fetchProducts", payload);
      csv = csv.map((item: any) => {
        const product = resp.data.response.docs.find((product: any) => {
          if(item.shopifyproductSKU == product.internalName)
          return product;
        })
        console.log(product);
        item.groupId = product.groupId;
        item.internalName = product.internalName; 
        item.parentProductName = product.parentProductName;
        item.imageUrl = product.mainImageUrl;
        item.isNewProduct = false;
        return item;
    })
    await store.dispatch('order/updateOrderList', csv);
    router.push({
      name:'Purchase Order Detail'
    })
  }
}    
export default actions;
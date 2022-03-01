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
    let groupIds = [] as any;
    const groupedProducts = {} as any;
    groupIds = resp.data.response.docs.map((item: any) => {
      return item.groupId;
    })
    groupIds = new Set([...groupIds]);
    groupIds.forEach((id: any) => {
      groupedProducts[id] =  resp.data.response.docs.filter((item: any) => {
        item.groupId = id;
        return item.groupId === id;
      })
      csv = csv.map((item: any) => {
        const product = resp.data.response.docs.find((product: any) => {
          if(item.shopifyproductSKU == product.internalName)
          return product;
        })
        item.groupId = product.groupId;
        item.internalName = product.internalName; 
        item.parentProductName = product.parentProductName;
        item.imageUrl = product.mainImageUrl;
        return item;
      })
    })
    await store.dispatch('order/updateOrderList', csv);
    router.push({
      name:'Purchase Order Detail'
    })
  }
}    
export default actions;
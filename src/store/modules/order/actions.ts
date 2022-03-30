import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import OrderState from './OrderState'
import * as types from './mutation-types'
import router from '@/router'


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
        item.parentProductId = product.groupId;
        item.internalName = product.internalName; 
        item.parentProductName = product.parentProductName;
        item.imageUrl = product.mainImageUrl;
        item.isNewProduct = "N";
        item.isSelected = true;
        return item;
    })

    const product = [] as any

    const parentIds = Array.from(new Set(items.map((ele: any) => ele.parentProductId)))
    parentIds.map((id) => {
      const variants = items.filter((item: any) => item.parentProductId == id)
      product.push({
        name: variants[0].parentProductName,
        id: variants[0].parentProductId,
        isSelected: true,
        orderId: variants[0].orderId,
        variants
      })
    })

    const original = JSON.parse(JSON.stringify(product))
    commit(types.ORDER_LIST_UPDATED, { items: product, original });
  },
  updatedOrderListItems({ commit }, orderListItems){
    commit(types.ORDER_LIST_ITEMS_UPDATED, orderListItems)
  },
}
export default actions;
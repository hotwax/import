import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import StockState from './StockState'
import * as types from './mutation-types'

const actions: ActionTree<StockState, RootState> = {
  async updatedStockList ({commit, rootGetters}, items) {
    const productIds = items.map((item: any) => {
      return item.productSKU
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
    items = items.map((item: any) => {
      const product = rootGetters['product/getProduct'](item.productSKU)
      
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
    const original = JSON.parse(JSON.stringify(items))

    commit(types.STOCK_LIST_UPDATED, { items, original, unidentifiedProductItems });
  },
}
export default actions;

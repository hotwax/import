export default interface StockState { 
  items: {
    parsed: any,
    original: any,
    unidentifiedItems: any,
    initial: any,
  }, 
  fileName: string,
  restockItems: [],
  schedule: {
    scheduledTime: string,
    shopId: string,
    restockName: string ,
    productStoreId: string
  }
  shopifyShops: any,
  jobs: any
}

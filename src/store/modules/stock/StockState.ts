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
    scheduledTime: any,
    shopId: any,
    restockName: any ,
    productStoreId: any,
    facilityId: any
  }
  shopifyShops: any,
  jobs: any
}

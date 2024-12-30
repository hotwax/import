import { api } from '@/adapter'

const getFacilities= async (payload: any): Promise <any> => {
  return api({
    url: "/performFind",
    method: "GET",
    params: payload,
    cache: true
  });
}

const getFacilityLocations = async (payload: any): Promise<any> => {
  return api({
    url: "/performFind",
    method: "POST",
    data: payload
  })
}

const fetchGoodIdentificationTypes = async (payload: any): Promise<any> => {
  return api({
    url: "/performFind",
    method: "POST",
    data: payload
  })
}

const fetchShopifyShop = async (payload: any): Promise<any> => {
  return api({
    url: "/performFind",
    method: "POST",
    data: payload
  })
}

const fetchProductStores = async (payload: any): Promise<any> => {
  return api({
    url: "/performFind",
    method: "POST",
    data: payload
  })
}

const fetchProducts = async (query: any): Promise<any> => {
  return api({
    url: "searchProducts",
    method: "post",
    data: query,
  });
}

const getServiceStatusDesc = async (payload: any): Promise<any> => {
  return api({
    url: "performFind",
    method: "get",
    params: payload,
    cache: true
  });
}

const fetchShipmentItems = async (query: any): Promise<any> => {
  return api({
    url: "shipment-detail",
    data: query,
    method: 'post'
  });
}

const addProductToShipment = async (payload: any): Promise<any> => {
  return api({
    url: "service/createShipmentItem",
    method: "POST",
    data: payload
  });
}

const updateShipmentItem = async (payload: any): Promise<any> => {
  return api({
    url: "service/updateShipmentItem",
    method: "POST",
    data: payload
  });
}

const removeShipmentItem = async (payload: any): Promise<any> => {
  return api({
    url: "service/deleteShipmentItem",
    method: "POST",
    data: payload
  });
}


const fetchDataManagerConfig = async (payload: any): Promise <any> => {
  return api ({
    url: "performFind",
    method: "get",
    params: payload
  })
}

const fetchDataManagerLogs = async (payload: any): Promise <any> => {
  return api ({
    url: "performFind",
    method: "get",
    params: payload
  })
}

const fetchDataResource = async (payload: any): Promise <any> => {
  return api ({
    url: "performFind",
    method: "get",
    params: payload
  })
}

const fetchFileData = async (payload: any): Promise <any> => {
  return api ({
    url: "DownloadCsvFile",
    method: "get",
    params: payload
  })
}

export const UtilService = {
    addProductToShipment,
    fetchDataManagerConfig,
    fetchDataManagerLogs,
    fetchDataResource,
    fetchFileData,
    fetchProducts,
    fetchProductStores,
    fetchShipmentItems,
    fetchGoodIdentificationTypes,
    fetchShopifyShop,
    getFacilities,
    getFacilityLocations,
    getServiceStatusDesc,
    removeShipmentItem,
    updateShipmentItem
}
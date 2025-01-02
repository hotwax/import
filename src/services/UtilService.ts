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
    method: "POST",
    data: query,
  });
}

const getServiceStatusDesc = async (payload: any): Promise<any> => {
  return api({
    url: "performFind",
    method: "GET",
    params: payload,
    cache: true
  });
}

const fetchShipmentItems = async (query: any): Promise<any> => {
  return api({
    url: "shipment-detail",
    method: "POST",
    data: query
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
    method: "GET",
    params: payload
  })
}

const fetchDataManagerLogs = async (payload: any): Promise <any> => {
  return api ({
    url: "performFind",
    method: "GET",
    params: payload
  })
}

const fetchDataResource = async (payload: any): Promise <any> => {
  return api ({
    url: "performFind",
    method: "GET",
    params: payload
  })
}

const fetchFileData = async (payload: any): Promise <any> => {
  return api ({
    url: "DownloadCsvFile",
    method: "GET",
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
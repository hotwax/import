import { api } from '@/adapter'
import { client } from "@hotwax/oms-api";
import {getHardcodedToken} from "@/utils";

const getFacilities = async (payload: any): Promise <any> => {
  const token = getHardcodedToken();
  return client({
    baseURL: "http://localhost:8080/rest/s1",
    url: "/admin/facilities",
    method: "GET",
    params: payload,
    cache: true,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
}

const getFacilityLocations = async (payload: any): Promise<any> => {
  const token = getHardcodedToken();
  return client({
    baseURL: "http://localhost:8080/rest/s1",
    url: `/facilities/${payload.inputFields.facilityId}/locations`,
    method: "GET",
    params: payload,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
}

const fetchGoodIdentificationTypes = async (payload: any): Promise<any> => {
  const token = getHardcodedToken();
  return client({
    baseURL: "http://localhost:8080/rest/s1",
    url: "/oms/goodIdentificationTypes",
    method: "GET",
    params: payload,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
}

const fetchShopifyShop = async (payload: any): Promise<any> => {
  const token = getHardcodedToken();
  return client({
    baseURL: "http://localhost:8080/rest/s1",
    url: "/admin/shopifyShops",
    method: "GET",
    params: payload,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
}

const fetchProductSelectorPref = async (payload?: any): Promise<any> => {
  const token = getHardcodedToken();
  const productStoreId = payload?.inputFields?.productStoreId || payload?.productStoreId;
  const settingTypeEnumId = payload?.inputFields?.settingTypeEnumId || payload?.settingTypeEnumId || "PRDT_IDEN_PREF";
  return client({
    baseURL: "http://localhost:8080/rest/s1",
    url: `/admin/productStores/${productStoreId}/settings`,
    method: "GET",
    params: {
      settingTypeEnumId: settingTypeEnumId
    },
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
}

const updateProductSelectorPref = async (payload: any): Promise<any> => {
  return api({
    url: "service/updateProductStoreSetting",
    method: "POST",
    data: payload
  })
}

const fetchProductStores = async (payload: any): Promise<any> => {
  const token = getHardcodedToken();
  return client({
    baseURL: "http://localhost:8080/rest/s1",
    url: "/admin/users/productStores",
    method: "GET",
    params: payload,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
}

const fetchProducts = async (query: any): Promise<any> => {
  const token = getHardcodedToken();
  return client({
    baseURL: "http://localhost:8080/rest/s1",
    url: "/admin/search/query",
    method: "POST",
    data: query,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
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
  const token = getHardcodedToken();
  return client({
    baseURL: "http://localhost:8080/rest/s1",
    url: "/admin/dataManager",
    method: "GET",
    params: payload,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
}

const fetchDataManagerLogs = async (payload: any): Promise <any> => {
  const token = getHardcodedToken();
  return client({
    baseURL: "http://localhost:8080/rest/s1",
    url: "/admin/dataManager/logs",
    method: "GET",
    params: payload,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
}

const fetchDataResource = async (payload: any): Promise <any> => {
  return api ({
    url: "performFind",
    method: "GET",
    params: payload
  })
}

const updateDataManagerConfig = async (payload: any): Promise <any> => {
  return api ({
    url: "service/updateDataManagerConfig",
    method: "POST",
    data: payload
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
    fetchProductSelectorPref,
    fetchProductStores,
    fetchShipmentItems,
    fetchGoodIdentificationTypes,
    fetchShopifyShop,
    getFacilities,
    getFacilityLocations,
    getServiceStatusDesc,
    removeShipmentItem,
    updateShipmentItem,
    updateDataManagerConfig,
    updateProductSelectorPref
}
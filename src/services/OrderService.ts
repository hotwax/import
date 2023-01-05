import api from '@/api';

const getFacilities= async (payload: any): Promise <any> => {
    return api({
      url: "/performFind",
      method: "POST",
      data: payload
    });
  }

const setFieldMapping = async (payload: any): Promise <any> => {
  return api({
    url: "/createDataManagerMapping",
    method: "POST",
    data: payload
  });
}

const updateFieldMapping = async (payload: any): Promise <any> => {
  return api({
    url: "/updateDataManagerMapping",
    method: "POST",
    data: payload
  });
}

const removeFieldMapping = async (payload: any): Promise <any> => {
  return api({
    url: "/deleteDataManagerMapping",
    method: "POST",
    data: payload
  });
}

export const OrderService = {
    getFacilities,
  setFieldMapping,
  updateFieldMapping,
  removeFieldMapping
  }
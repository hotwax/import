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
    url: "/service/createDataManagerMapping",
    method: "POST",
    data: payload
  });
}

const updateFieldMapping = async (payload: any): Promise <any> => {
  return api({
    url: "/service/updateDataManagerMapping",
    method: "POST",
    data: payload
  });
}

const deleteFieldMapping = async (payload: any): Promise <any> => {
  return api({
    url: "/service/deleteDataManagerMapping",
    method: "POST",
    data: payload
  });
}

export const OrderService = {
    getFacilities,
  setFieldMapping,
  updateFieldMapping,
  deleteFieldMapping
  }
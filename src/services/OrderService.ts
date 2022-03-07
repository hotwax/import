import api from '@/api';

const getFacilities= async (payload: any): Promise <any> => {
    return api({
      url: "/performFind",
      method: "POST",
      data: payload
    });
  }
export const OrderService = {
    getFacilities
  }
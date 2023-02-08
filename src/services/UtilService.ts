import api from '@/api';

const getFacilities= async (payload: any): Promise <any> => {
  return api({
    url: "/performFind",
    method: "POST",
    data: payload
  });
}

const getFacilityLocations = async (payload: any): Promise<any> => {
  return api({
    url: "/performFind",
    method: "POST",
    data: payload
  })
}

export const UtilService = {
    getFacilities,
    getFacilityLocations
}
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

export const UtilService = {
    getFacilities,
    getFacilityLocations
}
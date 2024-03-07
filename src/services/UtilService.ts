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

export const UtilService = {
    fetchGoodIdentificationTypes,
    getFacilities,
    getFacilityLocations
}
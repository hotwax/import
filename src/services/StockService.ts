import { api } from '@/adapter';

const scheduleJob = async (payload: any): Promise <any>  => {
  return api({
    url: "scheduleService",
    method: "post",
    data: payload
  });
}

const fetchJobInformation = async (payload: any): Promise <any>  => {
  return api({
    url: "/findJobs",
    method: "get",
    params: payload
  });
}

export const StockService = {
  scheduleJob,
  fetchJobInformation
}
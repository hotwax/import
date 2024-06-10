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

const updateJob = async (payload: any): Promise <any>  => {
  return api({
    url: "service/updateJobSandbox",
    method: "post",
    data: payload
  });
}

const cancelJob = async (payload: any): Promise <any> => {
  return api({
    url: "service/cancelScheduledJob",
    method: "post",
    data: payload
  });
}

export const StockService = {
  cancelJob,
  scheduleJob,
  fetchJobInformation,
  updateJob
}
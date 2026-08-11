import { api } from '@/adapter';
import { client } from "@hotwax/oms-api";
import { getHardcodedToken } from '@/utils';

const scheduleJob = async (payload: any): Promise<any> => {
  const token = getHardcodedToken();
  const jobName = payload.jobName || payload.systemJobEnumId || payload.jobId || "JOB_SCHEDULED_RSTK";
  return client({
    baseURL: "http://localhost:8080/rest/s1",
    url: `/admin/serviceJobs/${jobName}/runs`,
    method: "POST",
    data: payload,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
}

const fetchJobInformation = async (payload: any): Promise<any> => {
  const token = getHardcodedToken();
  return client({
    baseURL: "http://localhost:8080/rest/s1",
    url: `/admin/serviceJobs`,
    method: "GET",
    params: payload,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
}

const updateJob = async (payload: any): Promise<any> => {
  const token = getHardcodedToken();
  const jobName = payload.jobName || payload.systemJobEnumId || payload.jobId || "JOB_SCHEDULED_RSTK";
  return client({
    baseURL: "http://localhost:8080/",
    url: `/apps/system/ServiceJob/Jobs/ServiceJobDetail/updateJobParameter`,
    method: "POST",
    data: payload,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
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
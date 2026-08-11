import { api } from '@/adapter';
import { UploadRequest } from '@/types'
import { client } from "@hotwax/oms-api";
import { getHardcodedToken } from '@/utils';

const uploadJsonFile = async (payload: any): Promise <any>  => {
    return api({
      url: "uploadJsonFile",
      method: "post",
      ...payload
    });
}

const uploadAndImportFile = async (payload: any): Promise <any>  => {
  return api({
    url: "uploadAndImportFile",
    method: "post",
    ...payload
  });
}

const createIncomingShipment = async (payload: any): Promise <any>  => {
  const token = getHardcodedToken();
  return client({
    baseURL: "http://localhost:8080/rest/s1",
    url: "/poorti/createIncomingShipment",
    method: "post",
    data: payload,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
}

const prepareUploadJsonPayload = (request: UploadRequest) => {
      const blob = new Blob([JSON.stringify(request.uploadData)], { type: 'application/json'});
      const formData = new FormData();
      const fileName =  request.fileName ? request.fileName : Date.now() + ".json" ;
      formData.append("uploadedFile", blob, fileName);
      if (request.params) {
        for (const key in request.params) {
            formData.append(key, request.params[key]);
          }
      }
      return {
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data;'
        }
      }
}

export const UploadService = {
    prepareUploadJsonPayload,
    uploadAndImportFile,
    uploadJsonFile,
    createIncomingShipment
}
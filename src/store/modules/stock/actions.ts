import { ActionTree } from 'vuex'
import store from '@/store'
import RootState from '@/store/RootState'
import StockState from './StockState'
import * as types from './mutation-types'
import { showToast } from '@/utils';
import { hasError } from "@/adapter";
import { StockService } from "@/services/StockService";
import { translate, useUserStore } from "@hotwax/dxp-components";
import logger from "@/logger";
import { DateTime } from 'luxon'

const actions: ActionTree<StockState, RootState> = {
  async processUpdateStockItems ({ commit, rootGetters }, items) {
    this.dispatch('util/updateFileProcessingStatus', true);

    //Fetching only top 
    const productIds = items.slice(0, process.env['VUE_APP_VIEW_SIZE']).map((item: any) => item.identification);

    // We are getting external facilityId from CSV, extract facilityId and pass for getting locations
    const externalFacilityIds = [...new Set(items.map((item: any) => item.externalFacilityId))]
    const facilities = await store.dispatch('util/fetchFacilities');
    const facilityMapping = facilities.reduce((facilityMapping: any, facility: any) => {
      if (facility.externalId) facilityMapping[facility.externalId] = facility.facilityId;
      return facilityMapping;
    }, {})
    const facilityIds = externalFacilityIds.map((externalFacilityId: any) => {
      return facilityMapping[externalFacilityId];
    }).filter((facilityId: any) => facilityId)
    store.dispatch('util/fetchFacilityLocations', facilityIds);
    
    const viewSize = productIds.length;
    const viewIndex = 0;
    const payload = {
      viewSize,
      viewIndex,
      productIds,
      identificationTypeId: items[0]?.identificationTypeId //fetching identificationTypeId from first item, as all the items will have one identification type
    }
    const cachedProducts = await store.dispatch("product/fetchProducts", payload);

    // creating products object based on identification selected, if not doing so, and if we select an identification that is not equal to pseudoId of the product then the products are not displayed
    const products: any = Object.values(cachedProducts).reduce((updatedProducts: any, product: any) => {
      const identification = product.identifications.find((identification: any) => payload.identificationTypeId.toLowerCase() === identification.productIdTypeEnumId.toLowerCase())
      updatedProducts[identification.idValue] = product
      return updatedProducts;
    }, {})

    const parsed = [] as any;
    const initial = items.map((item: any) => {
      const product = products[item.identification];
      // Getting facilityId using externalFacilityId as the locations are saved by using facilityId as key
      const facilityId = facilityMapping[item.externalFacilityId]
      const facilityLocation = facilityId ? rootGetters['util/getFacilityLocationsByFacilityId'](facilityId)?.[0] : '';
      item.locationSeqId = facilityLocation?.locationSeqId;
      parsed.push(item);
      
      if (product) {
        item.parentProductId = product?.parent?.id;
        item.pseudoId = product.pseudoId;
        item.parentProductName = product?.parent?.productName;
        item.imageUrl = product.images?.mainImageUrl;
        item.isSelected = true;
        return item;
      }
      return;
    }).filter((item: any) => item);

    const original = JSON.parse(JSON.stringify(items));
    commit(types.STOCK_ITEMS_UPDATED, { parsed, original, initial });
    this.dispatch('util/updateFileProcessingStatus', false);
  },
  updateStockItems({ commit }, stockItems){
    commit(types.STOCK_ITEMS_UPDATED, stockItems);
  },
  clearStockItems({ commit }){
    commit(types.STOCK_ITEMS_UPDATED, { parsed: [], original: []});
  },
  async processUpdateRestockItems({ commit }, items) {
  
    const productIds = items.map((item: any) => item.identification);
  
    const payload = {
      productIds,
      identificationTypeId: items[0]?.identificationTypeId
    };
  
    const cachedProducts = await store.dispatch("product/fetchProducts", payload);
    // creating products object based on identification selected
    const products: any = Object.values(cachedProducts).reduce((updatedProducts: any, product: any) => {
      const identification = product.identifications.find((identification: any) => payload.identificationTypeId.toLowerCase() === identification.productIdTypeEnumId.toLowerCase())
      updatedProducts[identification.idValue] = product
      return updatedProducts;
    }, {})

    const initial = items.map((item: any) => {
      const product = products[item.identification];
      
      if (product) {
        item.parentProductId = product?.parent?.id;
        item.pseudoId = product.pseudoId;
        item.parentProductName = product?.parent?.productName;
        item.productId = product.productId
        item.imageUrl = product.images?.mainImageUrl;
        item.isSelected = true;
        return item;
      }
      return;
    }).filter((item: any) => item);
  
    return initial;
  },
  async shopifyShop({ commit }, payload) {
    commit(types.STOCK_SHOPIFY_SHOPS_UPDATED, payload)
  },
  
  async runServiceNow({ dispatch }, job) {
    let resp;
    const payload = {
      'JOB_NAME': job.jobName,
      'SERVICE_NAME': job.serviceName,
      'SERVICE_COUNT': '0',
      'SERVICE_TEMP_EXPR': job.tempExprId,
      'jobFields': {
        'systemJobEnumId': job.systemJobEnumId,
        'tempExprId': job.tempExprId, // Need to remove this as we are passing frequency in SERVICE_TEMP_EXPR, currently kept it for backward compatibility
        'parentJobId': job.parentJobId,
        'recurrenceTimeZone': this.state.user.current.userTimeZone,
        'createdByUserLogin': this.state.user.current.userLoginId,
        'lastModifiedByUserLogin': this.state.user.current.userLoginId
      },
      'statusId': "SERVICE_PENDING",
      'systemJobEnumId': job.systemJobEnumId,
    }
    
    try {
      resp = await StockService.scheduleJob({ ...payload });
      if (resp.status == 200 && !hasError(resp)) {
        showToast(translate("Service has been scheduled"))
      } else {
        showToast(translate("Something went wrong"))
      }
    } catch (err) {
      showToast(translate("Something went wrong"))
      logger.error(err)
    }
    return resp;
  },
  
  async scheduleService({ dispatch }, { params, restockName, scheduledTime, bulkFileProcessingJob }) {
    let resp, job;

    if(bulkFileProcessingJob) {
      job = bulkFileProcessingJob;
    } else {
      job = await dispatch("fetchDraftJob")
    }
    
    if(!job.jobId || !job.serviceName || job.serviceName == '_NA_') {
      showToast(translate("Configuration missing"))
      return;
    }

    let payload = {
      'JOB_NAME': bulkFileProcessingJob ? job.jobName : restockName || `Created ${DateTime.now().toLocaleString(DateTime.DATETIME_MED)}`,
      'SERVICE_NAME': job.serviceName,
      'SERVICE_COUNT': '0',
      'SERVICE_TEMP_EXPR': bulkFileProcessingJob ? "EVERY_5_MIN" : job.jobStatus,
      'SERVICE_RUN_AS_SYSTEM':'Y',
      'jobFields': {
        'systemJobEnumId': job.systemJobEnumId,
        'tempExprId': bulkFileProcessingJob ? "EVERY_5_MIN" : job.jobStatus, // Need to remove this as we are passing frequency in SERVICE_TEMP_EXPR, currently kept it for backward compatibility
        'parentJobId': job.parentJobId,
        'runAsUser': 'system', //default system, but empty in run now.  TODO Need to remove this as we are using SERVICE_RUN_AS_SYSTEM, currently kept it for backward compatibility
        'recurrenceTimeZone': this.state.user.current.userTimeZone,
        'createdByUserLogin': this.state.user.current.userLoginId,
        'lastModifiedByUserLogin': this.state.user.current.userLoginId,
      },
      'statusId': "SERVICE_PENDING",
      'systemJobEnumId': job.systemJobEnumId,
    } as any
    
    // If not a bulk file processing job, merge additional parameters of Scheduled Restock
    if(!bulkFileProcessingJob) {
      payload = {
        ...payload,
        ...params,
        SERVICE_TIME: scheduledTime.toString(),
      };
    }

    job?.priority && (payload['SERVICE_PRIORITY'] = job.priority.toString())
    job?.sinceId && (payload['sinceId'] = job.sinceId)

    try {
      resp = await StockService.scheduleJob({ ...payload });
        if(resp.status == 200 && !hasError(resp)) {
        showToast(translate('Service has been scheduled'));
        return resp.data;
      } else {
        throw resp.data
      }
    } catch(err) {
      showToast(translate('Something went wrong'))
      logger.error(err)
    }
    return {};
  },
 
  async fetchDraftJob() {
    let resp, job: any = {};

    const payload = {
      "inputFields": {
        "statusId": "SERVICE_DRAFT",
        "statusId_op": "equals",
        "systemJobEnumId": "JOB_SCHEDULED_RSTK",
        "systemJobEnumId_op": "equals"
      },
      "fieldList": [ "systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "currentRetryCount", "statusId", "runtimeDataId", "productStoreId", "priority"],
      "noConditionFind": "Y",
      "viewSize": 1,
      "orderBy": "runTime ASC"
    }

    try {
      resp = await StockService.fetchJobInformation(payload)

      if(!hasError(resp) && resp.data.docs.length) {
        job = resp.data.docs[0]

        job = {
          ...job,
          status: job.statusId,
          enumId: job.systemJobEnumId,
          frequency: job.tempExprId,
          id: job.jobId
        }
      } else {
        throw resp.data
      }
    } catch(err) {
      logger.error('Failed to fetch draft job')
      job = {}
    }

    return job;
  },

  async fetchJobs ({ commit }) {
    let resp;
    const currentProductStore: any = useUserStore().getCurrentEComStore

    try{
      const params = {
        "inputFields": {
          "statusId": ["SERVICE_PENDING", "SERVICE_FINISHED"],
          "productStoreId": currentProductStore.productStoreId,
          'systemJobEnumId': "JOB_SCHEDULED_RSTK",
          'systemJobEnumId_op': 'equals',
        },
        "orderBy": "runTime ASC",
        "noConditionFind": "Y",
        "viewSize": 50
      } as any
  
      resp = await StockService.fetchJobInformation(params)
  
      if(!hasError(resp) && resp.data.count > 0) {
        const jobs = resp.data.docs
        commit(types.STOCK_JOBS_UPDATED, jobs);
      } else {
        commit(types.STOCK_JOBS_UPDATED, []);
      } 
    } catch(error) {
      logger.error(error);
    }
    return resp
  },
  async updateMissingFacilities({ state }, facilityMapping){
    const facilityLocations = await this.dispatch('util/fetchFacilityLocations', Object.values(facilityMapping));
    Object.keys(facilityMapping).map((facilityId: any) => {
      const locationSeqId = facilityLocations[facilityMapping[facilityId]].length ? facilityLocations[facilityMapping[facilityId]][0].locationSeqId : '';
      state.items.parsed.map((item: any) => {
        if(item.externalFacilityId === facilityId){
          item.externalFacilityId = "";
          item.facilityId = facilityMapping[facilityId];
          item.locationSeqId = locationSeqId;
        }
      })
    })
    this.dispatch('stock/updateStockItems', state.items);
  }
}

export default actions;
<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>Scheduled Restock</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <ion-item>
          <ion-label>Restock</ion-label>
          <ion-label class="ion-text-right ion-padding-end">{{ file.name }} </ion-label>
          <input @change="parse" ref="file" class="ion-hide" type="file" id="restockInputFile" placeholder=/>
          <label for="restockInputFile" fill="outline">{{ translate("Upload") }}</label>
        </ion-item>

        <ion-list>
          <ion-list-header>{{ translate("Saved mappings") }}</ion-list-header>
          <div>
            <ion-chip :disabled="!this.content.length" outline @click="addFieldMapping()"> 
              <ion-icon :icon="addOutline" />
              <ion-label>{{ translate("New mapping") }}</ion-label>
            </ion-chip>
            <ion-chip :disabled="!this.content.length" outline="true" v-for="(mapping, index) in fieldMappings('RSTSTK') ?? []" :key="index" @click="mapFields(mapping)"> 
              {{ mapping.name }}
            </ion-chip>
          </div>
        </ion-list>

        <ion-list>
          <ion-list-header>{{ translate("Select the column index for the following information in the uploaded CSV.") }}</ion-list-header>
          <ion-item-divider>
            <ion-label> Required </ion-label>
          </ion-item-divider>
          <template :key="field" v-for="(fieldValues, field) in fields">

            <ion-item v-if="fieldValues.required">
              <ion-select :label="fieldValues.label" interface="popover" :placeholder = "translate('Select')" v-model="fieldMapping[field]">
                <ion-select-option :key="index" v-for="(prop, index) in fileColumns">{{ prop }}</ion-select-option>
              </ion-select>
            </ion-item>
          </template>

          <ion-item-divider>
            <ion-label> Optional, or select during review </ion-label>
          </ion-item-divider>
          <ion-item>
            <ion-label> Schedule </ion-label>   
            <ion-button slot="end" color="light" @click="updateTime()">{{ schedule ? getTime(schedule) : getTime(DateTime.now().toMillis()) }}</ion-button>
            <ion-modal class="date-time-modal" :is-open="isDateTimeModalOpen" @didDismiss="() => isDateTimeModalOpen = false">
              <ion-content force-overscroll="false">
                <ion-datetime    
                  id="schedule-datetime"        
                  show-default-buttons 
                  hour-cycle="h23"
                  presentation="date-time"
                  :value="schedule ? getTime(schedule) : DateTime.now()"
                  @ionChange="updateCustomTime($event)"
                />
              </ion-content>
            </ion-modal>
          </ion-item>
          <ion-item>
            <ion-select :label="translate('Product store')" interface="popover" :value="selectedProductStoreId" @ionChange="updateProductStore($event)">
              <ion-select-option v-for="productStore in productStores" :key="productStore.productStoreId" :value="productStore.productStoreId">
                {{ productStore.storeName || productStore.productStoreId}}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select :disabled="!selectedProductStoreId" label="Shopify store" interface="popover" :placeholder = "translate('Select')" v-model="selectedShopifyShopId">
              <ion-select-option v-for="shop in shopifyShops" :key="shop.shopId">
                {{ shop.name ? shop.name : shop.shopId }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item lines="full">
            <ion-input label="Restock name" placeholder='Created' v-model="restockName"></ion-input>
          </ion-item>
        </ion-list>
        
        <ion-button :disabled="!this.content.length" color="medium" expand="block" class="review" @click="review()">
          {{ translate("Review") }}
          <ion-icon slot="end" :icon="arrowForwardOutline" />
        </ion-button>

        <ion-list v-if="jobs.length">
          <ion-list-header>Scheduled Restock</ion-list-header>
          <ion-item v-for="job in jobs" :key="job.jobId">
            <ion-label>
              <p class="overline">{{ job.jobId }}</p>
                {{ job.jobName }}
              <p>inbound</p>
            </ion-label>
            <ion-button color="light" @click="changeRunTime(job)">{{ getTime(job.runTime) }}</ion-button>
            <ion-button fill="clear" color="medium" @click="openScheduledRestockPopover($event, job)">
              <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
            </ion-button> 
          </ion-item>
          <ion-modal class="date-time-modal" :is-open="isUpdateDateTimeModalOpen" @didDismiss="() => isUpdateDateTimeModalOpen = false">
            <ion-content force-overscroll="false">
              <ion-datetime    
                id="schedule-datetime"        
                show-default-buttons 
                hour-cycle="h23"
                presentation="date-time"
                :value="currentJob.runTime ? getDateTime(currentJob.runTime) : getDateTime(DateTime.now().toMillis())"
                @ionChange="changeJobRunTime($event)"
              />
            </ion-content>
          </ion-modal>
        </ion-list>

      </main>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { translate } from "@hotwax/dxp-components";
import { addOutline, arrowForwardOutline, ellipsisVerticalOutline } from "ionicons/icons";
import { IonButton, IonChip, IonContent, IonDatetime, IonHeader, IonIcon, IonInput, IonItem, IonItemDivider, IonLabel, IonList, IonListHeader, IonMenuButton, IonModal, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar, modalController, popoverController } from "@ionic/vue";
import ScheduledRestockPopover from "@/components/ScheduledRestockPopover.vue"
import parseFileMixin from '@/mixins/parseFileMixin';
import { showToast, hasError } from '@/utils';
import { mapGetters, useStore } from "vuex";
import CreateMappingModal from "@/components/CreateMappingModal.vue";
import { DateTime } from 'luxon';
import { UtilService } from '@/services/UtilService'
import logger from "@/logger";
import { StockService } from "@/services/StockService";

export default defineComponent({
  name: "ScheduledRestock",
  components: {
    IonButton,
    IonChip,
    IonContent,
    IonDatetime,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenuButton,
    IonModal,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
  },
  data() {
    return {
      file: {},
      content: [],
      fileColumns: [],
      fieldMapping: {},
      fields: process.env["VUE_APP_MAPPING_RSTSTK"] ? JSON.parse(process.env["VUE_APP_MAPPING_RSTSTK"]) : {},
      schedule: '',
      isDateTimeModalOpen: false,
      shopifyShops: [],
      restockName: '',
      selectedProductStoreId: '',
      selectedShopifyShopId: '',
      isUpdateDateTimeModalOpen: false,
      shopId: '',
      currentJob: {}
    }
  },
  computed: {
    ...mapGetters({
      fieldMappings: 'user/getFieldMappings',
      jobs: 'stock/getScheduledJobs',
      productStores: 'util/getProductStores',
      userProfile: 'user/getUserProfile'
    })
  },
  mixins:[ parseFileMixin ],
  async ionViewDidEnter() {
    this.selectedProductStoreId = ""
    this.selectedShopifyShopId = ""
    this.file = {}
    this.content = []
    this.fieldMapping = Object.keys(this.fields)?.reduce((fieldMapping, field) => {
      fieldMapping[field] = ""
      return fieldMapping;
    }, {})
    this.$refs.file.value = null;
    await this.store.dispatch('stock/fetchJobs')
    await this.store.dispatch('util/fetchProductStores')
  },

  methods: {
    async fetchShopifyShops(productStoreId) {
      let shopifyShops = []
      try {
        const resp = await UtilService.fetchShopifyShop({
          entityName: "ShopifyShop",
          inputFields: {
            productStoreId
          },
          viewSize: 100
        })

        if (!hasError(resp)) {
          shopifyShops = resp.data.docs
        } else {
          throw resp.data
        }
      } catch (error) {
        logger.error('Failed to fetch shopify shops.', error)
      }
      this.shopifyShops = shopifyShops
    },
    updateTime() {
      this.isDateTimeModalOpen = true
    },
    changeRunTime(job) {
      this.currentJob = job
      this.isUpdateDateTimeModalOpen = true
    },
    getTime(time) {
      return DateTime.fromMillis(time, { setZone: true}).toFormat("hh:mm a dd MMM yyyy")
    },
    updateCustomTime(event) {
      const currentTime = DateTime.now().toMillis();
      const setTime = DateTime.fromISO(event.detail.value).toMillis();
      if (setTime < currentTime) {
        showToast('Please provide a future date and time');
        return;
      }
      this.schedule = setTime;
    },
    changeJobRunTime(event) {
      const currentTime = DateTime.now().toMillis();
      const setTime = DateTime.fromISO(event.detail.value).toMillis();
      if (setTime < currentTime) {
        showToast('Please provide a future date and time');
        return;
      }
      this.updateJob(setTime)
    },
    async updateJob(updatedTime) {
      let resp;
      const job = {
        ...this.currentJob,
        runTime: updatedTime
      }

      const payload = {
        'jobId': job.jobId,
        'systemJobEnumId': job.systemJobEnumId,
        'recurrenceTimeZone': this.userProfile.userTimeZone,
        'tempExprId': job.jobStatus,
        'statusId': "SERVICE_PENDING",
        'runTimeEpoch': '',  // when updating a job clearning the epoch time, as job honors epoch time as runTime and the new job created also uses epoch time as runTime
        'lastModifiedByUserLogin': this.userProfile.userLoginId
      }

      job?.runTime && (payload['runTime'] = job.runTime)
      job?.sinceId && (payload['sinceId'] = job.sinceId)
      job?.jobName && (payload['jobName'] = job.jobName)

      try {
        resp = await StockService.updateJob(payload)
        if (!hasError(resp) && resp.data.successMessage) {
          await this.store.dispatch('stock/fetchJobs')
          showToast(translate('Service updated successfully'))
        } else {
          throw resp.data
        }
      } catch (err) {
        showToast(translate('Failed to update job'))
        logger.error(err)
      }
    },
    mapFields(mapping) {
      const fieldMapping = JSON.parse(JSON.stringify(mapping));

      // TODO: Store an object in this.content variable, so everytime when accessing it, we don't need to use 0th index
      const csvFields = Object.keys(this.content[0]);

      const missingFields = Object.values(fieldMapping.value).filter(field => {
        if(!csvFields.includes(field)) return field;
      });

      if(missingFields.length) showToast(translate("Some of the mapping fields are missing in the CSV: ", { missingFields: missingFields.join(", ") }))

      Object.keys(fieldMapping.value).map((key) => {
        if(!csvFields.includes(fieldMapping.value[key])){
          fieldMapping.value[key] = "";
        }
      })
      this.fieldMapping = fieldMapping.value;
    },
    async parse(event) {
      const file = event.target.files[0];
      try {
        if (file) {
          this.file = file;
          this.content = await this.parseCsv(this.file);
          this.fileColumns = Object.keys(this.content[0]);
          showToast(translate("File uploaded successfully"));
        } else {
          showToast(translate("No new file upload. Please try again"));
        }
      } catch {
        this.content = []
        showToast(translate("Please upload a valid reset inventory csv to continue"));
      }
    },
    async openScheduledRestockPopover(ev, job) {
      const popover = await popoverController.create({
        component: ScheduledRestockPopover,
        event: ev,
        translucent: true,
        showBackdrop: false,
        componentProps: { job }
      });
      return popover.present();
    },
    async review() {
      const areAllFieldsSelected = Object.values(this.fieldMapping).every(field => field !== "");
      if (!areAllFieldsSelected) {
        showToast(translate("Select all the fields to continue"));
        return;
      }

      const restockItems = this.content.map(item => {
        return {
          quantity: item[this.fieldMapping.restockQuantity],
          facilityId: '',
          product: item[this.fieldMapping.product],
          identificationTypeId: "SHOPIFY_PROD_SKU",
          externalFacilityId: item[this.fieldMapping.facility]
        }
      })

      await this.store.dispatch('stock/processUpdateRestockItems', restockItems);
      await this.store.dispatch('stock/scheduledStock', {
        productStoreId: this.selectedProductStoreId,
        shopId: this.selectedShopifyShopId,
        restockName: this.restockName,
        scheduledTime: this.schedule ? this.schedule : DateTime.now().toMillis()
      }) 
      this.router.push({
        name:'ScheduledRestockDetail'
      })
    },
    async addFieldMapping() {
      const createMappingModal = await modalController.create({
        component: CreateMappingModal,
        componentProps: { content: this.content, seletedFieldMapping: this.fieldMapping, mappingType: 'RSTSTK'}
      });
      return createMappingModal.present();
    },
    updateProductStore(event) {
      this.selectedShopifyShopId = ''
      this.selectedProductStoreId = event.detail.value;
      this.fetchShopifyShops(this.selectedProductStoreId);
    },
    getDateTime(time) {
      return DateTime.fromMillis(time).toISO()
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return {
      router,
      translate,
      addOutline,
      arrowForwardOutline,
      ellipsisVerticalOutline,
      store,
      DateTime
    }
  } 
})
</script>

<style scoped>
main {
  max-width: 732px;
  margin: var(--spacer-sm) auto 0; 
}

.review{
  margin: var(--spacer-base) var(--spacer-sm);
}

label {
  cursor: pointer;
}
</style>
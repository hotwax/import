<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/scheduled-incoming-inventory" />
        <ion-title>{{ translate("Launch details")}}</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="currentJob?.statusId === 'SERVICE_FINISHED'" @click="addProductToShipment()">
            <ion-icon slot="icon-only" :icon="addOutline"/>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div class="header">
        <div class="search ion-padding">
          <ion-item lines="none">
            <ion-label slot="start">
              <h1 v-show="!isJobNameUpdating">{{ jobName }}</h1>
              <ion-input ref="jobNameRef" :class="isJobNameUpdating ? 'name' : ''" v-show="isJobNameUpdating" aria-label="job name" @ionBlur="cancelRename" v-model="jobName"></ion-input>
            </ion-label>
          </ion-item>
          <ion-item :disabled="currentJob?.statusId === 'SERVICE_FINISHED'" lines="none">
            <ion-button v-show="!isJobNameUpdating" color="medium" size="small" fill="outline" @click="editJobName">{{ translate("Rename") }}</ion-button>
            <ion-button v-show="isJobNameUpdating" color="medium" size="small" fill="outline" @click="updateJobName">{{ translate("Save") }}</ion-button>
            <ion-button color="medium" size="small" fill="outline" @click="cancelInventory">{{ translate("Cancel") }}</ion-button>
          </ion-item>
        </div>
        <div class="filters">
          <ion-list>
            <ion-item>
              <ion-label>{{ translate("Schedule") }}</ion-label>  
              <ion-button class="date-time-button" slot="end" @click="updateTime">{{ currentJob.runTime ? getTime(currentJob.runTime) : translate("Select time") }}</ion-button> 
              <ion-modal class="date-time-modal" :is-open="isDateTimeModalOpen" @didDismiss="() => isDateTimeModalOpen = false">
                <ion-content force-overscroll="false">
                  <ion-datetime    
                    id="schedule-datetime"        
                    show-default-buttons 
                    hour-cycle="h23"
                    :min="DateTime.now().toISO()"
                    :value="currentJob?.runTime ? getDateTime(currentJob.runTime) : getDateTime(DateTime.now().toMillis())"
                    @ionChange="changeJobRunTime($event)"
                  />
                </ion-content>
              </ion-modal>     
            </ion-item>
            <ion-item lines="none"> 
              <ion-label>{{ translate("Shopify store") }}</ion-label>
              <ion-label slot="end">
                <p>{{ currentJob.shopId ? (getShopNameById(currentJob.shopId) || currentJob.shopId) : translate("No shop selected") }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </div>
      </div>

      <div v-if="!shipmentItems.length" class="empty-state">
        <p>{{ translate("No products found") }}</p>
      </div>
      <div v-else>
        <hr/>
        <div class="list-item" v-for="item in shipmentItems" :key="item.itemSeqId">
          <ion-item lines="none">
            <ion-thumbnail slot="start">
              <DxpShopifyImg :src="item.imageUrl" size="small" />
            </ion-thumbnail>
            <ion-label>
              <h2>{{ getProductIdentificationValue(productIdentificationPref.primaryId, getProductById(item.productId)) ? getProductIdentificationValue(productIdentificationPref.primaryId, getProductById(item.productId)) : item.productName }}</h2>
              <p>{{ getProductIdentificationValue(productIdentificationPref.secondaryId, getProductById(item.productId)) }}</p>
            </ion-label>
          </ion-item>
          <ion-chip outline class="tablet" @click="editShipmentItemQuantity(item)">
            <ion-label>{{ translate("incoming", { quantity: item.quantityOrdered }) }} </ion-label>
          </ion-chip>
          <ion-button :disabled="currentJob?.statusId === 'SERVICE_FINISHED'" color="medium" slot="end" fill="clear" class="ion-no-padding" @click="removeShipmentItem(item)">
            <ion-icon slot="icon-only" :icon="closeCircleOutline"/>
          </ion-button>          
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { computed, defineComponent, nextTick } from "vue";
import { IonBackButton, IonButton, IonButtons, IonChip, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonDatetime, IonPage, IonSelect, IonSelectOption, IonThumbnail, IonTitle, IonToolbar, alertController, modalController } from "@ionic/vue";
import { DxpShopifyImg, getProductIdentificationValue, translate, useProductIdentificationStore } from "@hotwax/dxp-components";
import { addOutline, closeCircleOutline, timerOutline, businessOutline, cloudUploadOutline, globeOutline} from "ionicons/icons"
import { mapGetters, useStore } from "vuex";
import { DateTime } from 'luxon';
import { showToast } from '@/utils';
import { StockService } from "@/services/StockService";
import { hasError } from "@/adapter";
import logger from "@/logger";
import emitter from "@/event-bus";
import { UtilService } from '@/services/UtilService'
import { useRouter } from "vue-router";
import AddProductModal from "@/components/AddProductModal.vue"

export default defineComponent({
  name: 'ScheduledRestockReview',
  components: {
    DxpShopifyImg,
    IonBackButton,
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonDatetime,
    IonPage,
    IonThumbnail,
    IonTitle,
    IonToolbar
  },
  computed: {
    ...mapGetters({
      jobs: 'stock/getScheduledJobs',
      shipmentItems: 'util/getShipmentItems',
      userProfile: 'user/getUserProfile',
      getProductById: 'product/getProductById',
    })
  },
  data() {
    return {
      isDateTimeModalOpen: false,
      shopifyShops: [],
      currentJob: [],
      isJobNameUpdating: false,
      jobNameRef: '',
      jobName: ''
    }
  },

  async ionViewDidEnter() {
    await this.store.dispatch('stock/fetchJobs')
    await this.fetchJob(this.$route.params.id);
    await this.store.dispatch("util/fetchShipmentItems", { shipmentId: this.currentJob.runtimeData?.shipmentId })
    if(this.currentJob.productStoreId) {
      this.fetchShopifyShops(this.currentJob.productStoreId);
    }
  },
  methods: {
    async editJobName() {
      this.isJobNameUpdating = !this.isJobNameUpdating
      // Waiting for DOM updations before focus inside the text-area, as it is conditionally rendered in the DOM
      await nextTick()
      this.$refs.jobNameRef.$el.setFocus();
    },
    async updateJobName() {
      if(!this.jobName?.trim()) {
        showToast(translate("Enter a valid Job name"))
        return;
      }
      if(this.jobName.trim() !== this.currentJob.jobName.trim()) {
        await this.updateJob(this.currentJob.runTime, this.jobName)
      }
      this.isJobNameUpdating = false
    },
    cancelRename() {
      if(this.isJobNameUpdating) {
        this.jobName = this.currentJob.jobName
        this.isJobNameUpdating = false
      }
    },
    getShopNameById(shopId) {
      const shop = this.shopifyShops.find(shop => shop.shopId === shopId);
      return shop?.name;
    },
    getTime(time) {
      return DateTime.fromMillis(time, { setZone: true}).toFormat("hh:mm a dd MMM yyyy")
    },
    getDateTime(time) {
      return DateTime.fromMillis(time).toISO()
    },
    updateTime() {
      this.isDateTimeModalOpen = true
    },
    changeJobRunTime(event) {
      const currentTime = DateTime.now().toMillis();
      const setTime = DateTime.fromISO(event.detail.value).toMillis();
      if (setTime < currentTime) {
        showToast(translate("Please provide a future date and time"));
        return;
      }
      this.updateJob(setTime)
    },
    async updateJob(updatedTime, jobName = '') {
      let resp;
      const job = {
        ...this.currentJob,
        runTime: updatedTime,
        jobName: jobName ? jobName.trim() : this.currentJob.jobName.trim()
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
          await this.fetchJob(this.$route.params.id);
          showToast(translate('Service updated successfully'))
        } else {
          throw resp.data
        }
      } catch (err) {
        showToast(translate('Failed to update job'))
        logger.error(err)
      }
    },
    async addProductToShipment() {
      const addProductModal = await modalController.create({
        component: AddProductModal,
        componentProps: { shipmentId: this.currentJob.runtimeData?.shipmentId },
        showBackdrop: false,
      });

      await addProductModal.present();
    },
    async removeShipmentItem(item) {
      const message = translate("will be removed from the scheduled inventory.", { product: item.productName });
      const alert = await alertController.create({
        header: translate("Remove item"),
        message,
        buttons: [
          {
            text: translate("Keep"),
          },
          {
            text: translate("Remove"),
            handler: async() => {
              const payload = {
                shipmentId: this.currentJob.runtimeData?.shipmentId,
                shipmentItemSeqId: item.itemSeqId
              }

              try {
                const resp = await UtilService.removeShipmentItem(payload)
                if(!hasError(resp)) {
                  showToast(translate("Product removed successfully"))
                  await this.store.dispatch('util/fetchShipmentItems', { shipmentId: this.currentJob.runtimeData?.shipmentId })
                } else {
                  throw resp.data;
                }
              } catch(err) {
                showToast(translate('Failed to remove item from shipment'))
                logger.error(err)
              }
            }
          }
        ],
      });
      return alert.present();
    },

    async editShipmentItemQuantity(shipmentItem) {
      const alert = await alertController.create({
        header: translate("Update quantity"),
        inputs: [{
          name: "itemQuantity",
          value: shipmentItem.quantityOrdered
        }],
        buttons: [
          {
            text: translate("Cancel"),
            role: "cancel"
          },
          {
            text: translate("Update"),
            handler: async (data) => {
              const updatedItemQuantity = data.itemQuantity.trim()

              const payload = {
                shipmentId: this.currentJob.runtimeData?.shipmentId,
                shipmentItemSeqId: shipmentItem.itemSeqId,
                quantity: updatedItemQuantity
              }

              emitter.emit("presentLoader");
              try {
                const resp = await UtilService.updateShipmentItem(payload)
                if(!hasError(resp)) {
                  showToast(translate("Shipment item quantity updated successfully"));
                  await this.store.dispatch('util/fetchShipmentItems', { shipmentId: this.currentJob.runtimeData?.shipmentId });
                } else {
                  throw resp.data;
                }
              } catch(err) {
                showToast(translate("Failed to update shipment item quantity"))
                logger.error(err)
              }
              
              emitter.emit('dismissLoader')
            }
          }
        ]
      });
      await alert.present();
    },
    fetchJob(jobId) {
      this.currentJob = this.jobs.find(job => job.jobId === jobId);
      this.jobName = JSON.parse(JSON.stringify(this.currentJob?.jobName));
    },
    async cancelInventory() {
      const message = translate("Are you sure you want to cancel this upcoming inventory?");
      const alert = await alertController.create({
        header: translate("Cancel inventory"),
        message,
        buttons: [
          {
            text: translate("Keep"),
          },
          {
            text: translate("Cancel"),
            handler: async() => {
              let resp
              try {
                resp = await StockService.cancelJob({
                  jobId: this.currentJob.jobId
                });
                if (resp.status == 200 && !hasError(resp)) {
                  showToast(translate("Inventory cancelled successfully"));
                  await this.store.dispatch('stock/fetchJobs')
                  this.router.replace({ name: 'ScheduledIncomingInventory' })
                } else {
                  throw resp.data;
                }
              } catch (err) {
                showToast(translate("Failed to cancel job"))
                logger.error(err)
              }
            }
          }
        ],
      });
      return alert.present();
    },
    async fetchShopifyShops(productStoreId) {
      let shopifyShops = []
      try {
        const resp = await UtilService.fetchShopifyShop({
          entityName: "ShopifyShop",
          fieldList: ['name', 'shopId'],
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
      this.currentJob.shopId = this.shopifyShops.length && this.shopifyShops[0]?.shopId ? this.shopifyShops[0].shopId : '';
    },
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const productIdentificationStore = useProductIdentificationStore();
    let productIdentificationPref = computed(() => productIdentificationStore.getProductIdentificationPref);

    return {
      translate,
      addOutline,
      closeCircleOutline,
      timerOutline,
      businessOutline,
      store,
      cloudUploadOutline,
      DateTime,
      getProductIdentificationValue,
      globeOutline,
      productIdentificationPref,
      router
    }
  }
})
</script>
  
<style scoped>
.list-header {
  background-color: var(--ion-color-light);
}

.list-item {
  --columns-desktop: 4;
  --columns-tablet: 4;
  border-bottom : 1px solid var(--ion-color-medium);
}

.list-item > ion-item {
  width: 100%;
}

.list-item :first-child ion-label {
  word-break: break-all;
}

.list-item > *:last-child {
  display: unset;
  justify-self: unset;
}

.header {
  display: grid;
  grid: "search filters"
        /1fr 1fr;
}

.search {
  grid-area: search;
}

.filters {
  grid-area: filters;
  max-width: 650px;
}

ion-content {
  --padding-bottom: 80px;
}

@media (max-width: 991px) {
  .header {
    grid: "search"
          "filters"
          / auto;
    padding: 0;
  }
}
</style>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/adjust-inventory" />
        <ion-title>{{ translate("History")}}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="header ion-margin-top">
        <section>
          <ion-item>
            <ion-label lines="none">
              <p class="overline">{{ configDetails?.configId }}</p>
              <h1>{{ configDetails?.description }}</h1>
            </ion-label>
          </ion-item>
          <ion-list>
            <ion-item>
              <ion-icon slot="start" :icon="shareSocialOutline" />
              {{ translate("Multithreading") }}
              <ion-label slot="end">{{ configDetails?.multiThreading ? configDetails.multiThreading : "-" }}</ion-label>
            </ion-item>
            <ion-item>
              <ion-icon slot="start" :icon="globeOutline" />
              {{ translate("SFTP") }}
              <ion-label class="ion-text-wrap" slot="end">{{ configDetails?.importPath ? configDetails.importPath : "-" }}</ion-label>
            </ion-item>
            <ion-item>
              <ion-icon slot="start" :icon="optionsOutline" />
              <ion-select :label="translate('Mode')" interface="popover" :value="configDetails?.executionModeId" @ionChange="updateDataManagerExecutionMode($event.detail.value)">
                <ion-select-option value="DMC_SYNC">{{ translate("Sync") }}</ion-select-option>
                <ion-select-option value="DMC_ASYNC">{{ translate("Async") }}</ion-select-option>
                <ion-select-option value="DMC_QUEUE">{{ translate("Queued") }}</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>
        </section>
        <div></div>
      </div>

      <ion-item lines="none" class="ion-padding-top">
        <ion-chip v-for="filter in dataManagerLogFilters" :key="filter.id" outline @click="filterDataManagerLogs(filter.id)">
          <ion-label>{{ filter.label }}</ion-label>
          <ion-icon v-if="selectedFilter === filter.id" :icon="checkmarkOutline" />
        </ion-chip>
        <!-- TODO: Discuss the functionality of this button.. -->
        <!-- <ion-button slot="end" fill="outline" size="medium" @click="router.replace({ name: 'AdjustInventory' })">
          {{ translate("Upload file") }}
          <ion-icon slot="end" :icon="cloudUploadOutline"/>
        </ion-button> -->
      </ion-item>

      <div class="empty-state" v-if="isLoading">
        <ion-spinner name="crescent" />
      </div>
      <div v-else-if="filteredDataManagerLogList?.length">
        <div class="list-item" v-for="(log, index) in filteredDataManagerLogList" :key="index">
          <ion-item lines="none">
            <ion-icon slot="start" :icon="documentTextOutline" />
            <ion-label>
              <p class="overline">{{ log.logId }}</p>
              {{ log.contentName }}
              <p>{{ getDateTime(log.createdDate) }}</p>
            </ion-label>
          </ion-item>
  
          <ion-label>
            {{ log.startDateTime ? getDateTime(log.startDateTime) : '-' }}
            <p>{{ translate("Started") }}</p>
          </ion-label>
  
          <ion-label>
            {{ log.finishDateTime ? getDateTime(log.finishDateTime) : '-' }}
            <p>{{ translate("Finished") }}</p>
          </ion-label>

          <ion-badge v-if="log.statusId" :color="log.statusId === 'SERVICE_FAILED' ? 'danger' : 'success'">{{ translate(getStatusDesc(log.statusId)) }}</ion-badge>
          
          <div class="ion-text-center" lines="none" v-if="log.errorRecordContentId" button @click="downloadErrorRecordFile(log)">
            <ion-icon slot="start" :icon="cloudDownloadOutline" />
            <ion-label>
              <p>{{ translate("Failed records") }}</p>
            </ion-label>
          </div>
          <div v-else></div>
  
          <ion-button fill="clear" color="medium" @click="openDownloadLogsFilePopover(log, $event)">
            <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
          </ion-button>
        </div>
      </div>
      <div v-else class="empty-state">
        {{ translate("No logs found") }}
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { checkmarkOutline, cloudDownloadOutline, cloudUploadOutline, documentTextOutline, ellipsisVerticalOutline, globeOutline, optionsOutline, shareSocialOutline } from "ionicons/icons";
import { IonBackButton, IonBadge, IonButton, IonChip, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar, popoverController } from "@ionic/vue";
import { defineComponent } from 'vue'
import { mapGetters, useStore } from 'vuex'
import { translate } from '@hotwax/dxp-components'
import { UtilService } from "@/services/UtilService"
import { useRouter } from "vue-router";
import { hasError, saveDataFile, showToast } from '@/utils'
import { DateTime } from 'luxon'
import logger from "@/logger";
import DownloadLogsFilePopover from "@/components/DownloadLogsFilePopover.vue";

export default defineComponent ({
  name: "AdjustInventoryHistory",
  components: {
    IonBackButton,
    IonBadge,
    IonButton,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonSelect,
    IonSelectOption, 
    IonSpinner,
    IonTitle,
    IonToolbar,
  },
  data() {
    return {
      selectedFilter: 'All',
      dataManagerLogFilters: [
        { id: 'ALL', label: 'All' },
        { id: 'FAILED_LOGS', label: 'Failed logs' },
        { id: 'FAILED_RECORDS', label: 'Failed records' }
      ],
      isLoading: true,
      dataManagerLogList: [],
      filteredDataManagerLogList: [],
    }
  },
  computed: {
    ...mapGetters({
      getStatusDesc: 'util/getStatusDesc',
      configDetails: 'util/getDataManagerConfig'
    }),
  },
  async ionViewDidEnter() {
    await this.store.dispatch('util/fetchDataManagerConfig', "MDM_INV_VARIANCE");
    await this.fetchDataManagerLogs();
    if(this.filteredDataManagerLogList) {
      await this.fetchDataResource(this.filteredDataManagerLogList)
    }
    this.filterDataManagerLogs("ALL");
    this.isLoading = false;
  },
  methods: {
    filterDataManagerLogs(id) {
      this.selectedFilter = id;
      if(id === "ALL") {
        this.filteredDataManagerLogList = [...this.dataManagerLogList]
      } else if(id === "FAILED_LOGS") {
        this.filteredDataManagerLogList = this.dataManagerLogList.filter(log => log.statusId === 'SERVICE_FAILED')
      } else if(id === "FAILED_RECORDS") {
        this.filteredDataManagerLogList = this.dataManagerLogList.filter(log => log.errorRecordContentId !== null)
      }
    },
    getDateTime(time) {
      return DateTime.fromMillis(time).toFormat("dd/MM/yyyy H:mm a")
    },
    async fetchDataManagerLogs() {
      const payload = {
        "inputFields":  {
          "systemJobEnumId_op": "not-empty",
          "configId": "MDM_INV_VARIANCE"
        },
        "fieldList": ["statusId", "logId", "createdDate", "startDateTime", "finishDateTime", "logFileContentId", "errorRecordContentId", "contentName", "dataResourceId"],
        "noConditionFind": "Y",
        "viewSize": 250,
        "entityName": "DataManagerLogAndContent",
      }

      try {
        const resp = await UtilService.fetchDataManagerLogs(payload);
        if(resp.data.docs?.length > 0 && !hasError(resp)) {
          this.dataManagerLogList = resp.data.docs;
          this.filteredDataManagerLogList = [...this.dataManagerLogList];
        } else {
          throw resp.data;
        }
      } catch(err) {
        logger.error(err);
      }
    },
    async fetchDataResource(dataManagerLogList) {
      // Extract logFileContentId and errorRecordContentId from logs
      const contentIds = [].concat(...dataManagerLogList.map((log) => [log.logFileContentId, log.errorRecordContentId].filter(id => id)));
  
      const payload = {
        "inputFields": {
          "coContentId": contentIds,
          "coContentId_op": "in"
        },
        "fieldList": ["coContentId", "coDataResourceId", "coContentName"], 
        "noConditionFind": "Y",
        "viewSize": 250,
        "entityName": "DataResourceContentView"
      }
    
      try {
        const resp = await UtilService.fetchDataResource(payload);
        if(resp.data.docs?.length > 0 && !hasError(resp)) {
          dataManagerLogList.forEach((log) => {
            const logFileDataResource = resp.data.docs.find((doc) => doc.coContentId === log.logFileContentId);
            if(logFileDataResource) {
              log.logFileDataResourceId = logFileDataResource.coDataResourceId;
              log.logFileContentName = logFileDataResource.coContentName;
            }
    
            const errorRecordDataResource = resp.data.docs.find((doc) => doc.coContentId === log.errorRecordContentId);
            if(errorRecordDataResource) {
              log.errorRecordDataResourceId = errorRecordDataResource.coDataResourceId;
              log.errorRecordContentName = errorRecordDataResource.coContentName;
            }
          });
        }
      } catch(err) {
        logger.error(err);
      }
    },
    async updateDataManagerExecutionMode(mode) {

      try {
        const resp = await UtilService.updateDataManagerConfig({
          configId: this.configDetails.configId,
          executionModeId: mode
        })

        if(!hasError(resp)) {
          showToast(translate("Execution mode updated successfully"))
        } else {
          throw resp.data;
        }
      } catch(err) {
        showToast(translate("Failed to update execution mode"))
        logger.error(err)
      }
    },
    async openDownloadLogsFilePopover(dataManagerLog, event) {
      const popover = await popoverController.create({
        component: DownloadLogsFilePopover,
        showBackdrop: false,
        event: event,
        componentProps: { dataManagerLog }
      });
      return popover.present()
    },
    async downloadErrorRecordFile(dataManagerLog) {
      try {
        if(dataManagerLog?.errorRecordDataResourceId) {
          const response = await UtilService.fetchFileData({
            dataResourceId: dataManagerLog.errorRecordDataResourceId
          });
          saveDataFile(response.data, dataManagerLog?.errorRecordContentName);
        }
      } catch(error) {
        logger.error(error);
      }
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      checkmarkOutline,
      cloudDownloadOutline,
      cloudUploadOutline,
      documentTextOutline,
      ellipsisVerticalOutline,
      globeOutline,
      optionsOutline,
      shareSocialOutline,
      translate,
      store,
      router
    }
  }
})
</script>

<style scoped>
.header > section {
  overflow: hidden;
  border: var(--border-medium);
  border-radius: 16px;
}

.list-item {
  --columns-desktop: 6;
}

.list-item > ion-item {
  width: 100%;
}

.header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(375px, 1fr));
  grid-gap: var(--spacer-sm);
}

@media (max-width: 991px) {
  .header {
    grid-template-columns: 1fr;
  }
}
</style> 

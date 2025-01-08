<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-back-button default-href="/unified-inventory" slot="start" />
        <ion-title>{{ translate("Adjust Inventory") }}</ion-title>
        <ion-buttons slot="end">
          <!-- TODO: We need to discuss what to display on this button click. -->
          <!-- <ion-button size="medium">
            <ion-icon  slot="icon-only" :icon="settingsOutline" />
          </ion-button> -->
          <ion-button size="medium" @click="openHelpModal()">
            <ion-icon slot="icon-only" :icon="informationCircleOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <ion-item>
          <ion-label>{{ translate("Adjust") }}</ion-label>
          <ion-label class="ion-text-right ion-padding-end">{{ file.name }} </ion-label>
          <input @change="parse" ref="file" class="ion-hide" type="file" id="restockInputFile"/>
          <label for="restockInputFile" fill="outline">{{ translate("Upload") }}</label>
        </ion-item>

        <ion-list>
          <ion-list-header>{{ translate("Saved mappings") }}</ion-list-header>
          <div>
            <ion-chip :disabled="!this.content.length" outline @click="addFieldMapping()"> 
              <ion-icon :icon="addOutline" />
              <ion-label>{{ translate("New mapping") }}</ion-label>
            </ion-chip>
            <ion-chip :disabled="!this.content.length" :outline="selectedMappingId != index" v-for="(mapping, index) in fieldMappings('ADJINV') ?? []" :key="index" @click="mapFields(mapping, index)"> 
              {{ mapping.name }}
            </ion-chip>
          </div>
        </ion-list>

        <ion-list>
          <ion-list-header>{{ translate("Map all required columns from the uploaded CSV") }}</ion-list-header>
          <ion-item-divider>
            <ion-label>{{ translate("Required") }} </ion-label>
          </ion-item-divider>
          <ion-item :key="field" v-for="(fieldValues, field) in fields">
            <template v-if="field === 'productIdentification'">
              <ion-select aria-label="identification-type-id" interface="popover" :placeholder = "translate('Select')" v-model="identificationTypeId">
                <ion-select-option :key="goodIdentificationType.goodIdentificationTypeId" :value="goodIdentificationType.goodIdentificationTypeId" v-for="goodIdentificationType in goodIdentificationTypes">{{ goodIdentificationType.description }}</ion-select-option>
              </ion-select>
              <ion-select aria-label="identification-type-value" interface="popover" :disabled="!content.length" :placeholder = "translate('Select')" slot="end" v-model="fieldMapping['productIdentification']">
                <ion-select-option :key="index" v-for="(prop, index) in fileColumns">{{ prop }}</ion-select-option>
              </ion-select>
            </template>
            <template v-else>
              <ion-select :label="translate(fieldValues.label)" interface="popover" :disabled="!content.length" :placeholder = "translate('Select')" v-model="fieldMapping[field]">
                <ion-select-option :key="index" v-for="(prop, index) in fileColumns">{{ prop }}</ion-select-option>
              </ion-select>
            </template>
          </ion-item>
        </ion-list>

        <ion-button :disabled="!this.content.length" color="medium" size="large" expand="block" class="review" @click="upload">
          {{ translate("Upload") }}
          <ion-icon slot="end" :icon="cloudUploadOutline" />
        </ion-button>

        
        <div v-if="configDetails.executionModeId === 'DMC_QUEUE'">
          <template v-if="Object.keys(pendingJob).length">
            <!-- Pending Jobs in Queue -->
            <ion-item lines="none">
              <ion-label>
                {{ translate("Uploaded files will be processed in", { runTime: getRunTime() }) }}
              </ion-label>
              <ion-label slot="end">
                <p>{{ translate("Queued") }}</p>
              </ion-label>
            </ion-item>
            <ion-button color="medium" expand="block" fill="outline" class="review" @click="runNow('pending')">
              {{ translate("Run now") }}
            </ion-button>
          </template>

          <template v-else>
            <!-- Draft jobs in Queue -->
            <ion-item lines="none">
              <ion-label>
                {{ translate("Uploaded files will not be processed until the bulk file processing job is enabled.") }}
              </ion-label>
              <ion-label slot="end">
                <p>{{ translate("Queued") }}</p>
              </ion-label>
            </ion-item>
            <ion-item lines="none" class="adjust-buttons">
              <ion-button color="medium" size="medium" fill="outline" @click="enableJob()">
                {{ translate("Enable") }}
              </ion-button>
              <ion-button color="medium" size="medium" fill="outline" @click="runNow('draft')">
                {{ translate("Run once") }}
              </ion-button>
            </ion-item>
          </template>
        </div>

        <ion-item v-else lines="none">
          <ion-label>
            {{ translate( configDetails.executionModeId === 'DMC_SYNC' ? "Uploaded files will be processed immediately" : "Uploaded files will be processed asynchronously") }}
          </ion-label>
          <ion-label slot="end">
            <p>{{ translate( configDetails.executionModeId === 'DMC_SYNC' ? "Sync" : "Async") }}</p>
          </ion-label>
        </ion-item>
        
        <ion-button color="medium" expand="block" fill="outline" class="review" @click="router.push({ name: 'AdjustInventoryHistory' })">
          {{ translate("View history") }}
          <ion-icon slot="end" :icon="arrowForward" />
        </ion-button>
      </main>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useRouter } from "vue-router";
import { translate, useUserStore } from "@hotwax/dxp-components";
import { addOutline, arrowForward, cloudUploadOutline, informationCircleOutline, settingsOutline } from "ionicons/icons";
import { IonBackButton, IonButton, IonButtons, IonChip, IonContent, IonHeader, IonIcon, IonItem, IonItemDivider, IonLabel, IonList, IonListHeader, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar, modalController, alertController } from "@ionic/vue";
import { jsonToCsv, showToast, hasError } from '@/utils';
import { mapGetters, useStore } from "vuex";
import { DateTime } from 'luxon';
import parseFileMixin from '@/mixins/parseFileMixin';
import logger from "@/logger";
import CreateMappingModal from "@/components/CreateMappingModal.vue";
import HelpModal from "@/components/HelpModal.vue"
import { StockService } from "@/services/StockService";
import { UploadService } from "@/services/UploadService";

export default defineComponent({
  name: "AdjustInventory",
  components: {
    IonBackButton,
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonListHeader,
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
      fields: process.env["VUE_APP_MAPPING_ADJINV"] ? JSON.parse(process.env["VUE_APP_MAPPING_ADJINV"]) : {},
      identificationTypeId: "SHOPIFY_PROD_SKU",
      draftJob: {},
      pendingJob: {},
      selectedMappingId: ""
    }
  },
  computed: {
    ...mapGetters({
      configDetails: 'util/getDataManagerConfig',
      fieldMappings: 'user/getFieldMappings',
      goodIdentificationTypes: 'util/getGoodIdentificationTypes',
      instanceUrl: 'user/getInstanceUrl',
    })
  },
  mixins:[ parseFileMixin ],
  async ionViewDidEnter() {
    this.file = {}
    this.content = []
    this.fieldMapping = Object.keys(this.fields)?.reduce((fieldMapping, field) => {
      fieldMapping[field] = ""
      return fieldMapping;
    }, {})
    this.$refs.file.value = null;
    await this.fetchJobs();
    await this.store.dispatch('util/fetchDataManagerConfig', "MDM_INV_VARIANCE");
    await this.store.dispatch('util/fetchGoodIdentificationTypes');
  },

  methods: {
    getRunTime() {
      const runTime = this.pendingJob?.runTime
      return DateTime.fromMillis(runTime).toLocaleString(DateTime.DATETIME_MED);
    },
    async openHelpModal() {
      const helpModal = await modalController.create({
        component: HelpModal,
      });
      
      return helpModal.present();
    },
    mapFields(mapping, mappingId) {
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
      this.selectedMappingId = mappingId;
    },
    async addFieldMapping() {
      const createMappingModal = await modalController.create({
        component: CreateMappingModal,
        componentProps: { content: this.content, seletedFieldMapping: this.fieldMapping, mappingType: 'ADJINV'}
      });
      
      createMappingModal.onDidDismiss().then((result) => {
        if(result.data?.mappingId) {
          this.selectedMappingId = result.data.mappingId
        }
      })
      
      return createMappingModal.present();
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
    async runNow(jobStatus) {
      const job = jobStatus === "pending" ? this.pendingJob : this.draftJob

      const jobAlert = await alertController
        .create({
          header: translate("Run now"),
          message: translate("Running this job now will not replace this job. A copy of this job will be created and run immediately. You may not be able to reverse this action.", { space: '<br/><br/>' }),
          buttons: [
            {
              text: translate("Cancel"),
              role: "cancel",
            },
            {
              text: translate("Run now"),
              handler: () => {
                this.store.dispatch('stock/runServiceNow', job)
              }
            }
          ]
        });
      return jobAlert.present();
    },
    async enableJob() {
      try {
        const resp = await this.store.dispatch("stock/scheduleService", { bulkFileProcessingJob: this.draftJob });
        if(resp) {
          await this.fetchJobs(true);
        }
      } catch(error) {
        logger.error(error);
      }
    },
    async fetchJobs(fetchOnlyPendingJob = false) {
      const fetchJobRequests = [];
      
      try{
        const params = {
          "inputFields": {
            'statusId': fetchOnlyPendingJob ? "SERVICE_PENDING" : "SERVICE_DRAFT",
            'systemJobEnumId': "JOB_PRC_PND_DML",
            'systemJobEnumId_op': 'equals',
          },
          "orderBy": "runTime ASC",
          "noConditionFind": "Y",
          "viewSize": 1
        }
        // Fetch draft jobs
        if (!fetchOnlyPendingJob) {
          fetchJobRequests.push(StockService.fetchJobInformation(params).catch((err) => {
            return err;
          }));
        }

        // Update params for pending jobs
        params.inputFields.statusId = "SERVICE_PENDING";

        // Fetch pending jobs
        fetchJobRequests.push(StockService.fetchJobInformation(params).catch((err) => {
          return err;
        }))

        const resp = await Promise.all(fetchJobRequests)
        resp.map((response) => {
          if(!hasError(response) && response.data.docs?.length) {          
            const job = response.data.docs[0]
            if(job.statusId === "SERVICE_DRAFT") {
              this.draftJob = job;
            } else if(job.statusId === "SERVICE_PENDING") {
              this.pendingJob = job;
            }
          } else {
            throw resp.data
          }
        })
      } catch(error) {
        logger.error(error);
      }
    },
    async upload() {
      
      const areAllFieldsSelected = Object.values(this.fieldMapping).every(field => field !== "");
      if (!areAllFieldsSelected) {
        showToast(translate("Select all the fields to continue"));
        return;
      }
      
      const uploadData = this.content.map(item => {
        return {
          identification: item[this.fieldMapping.productIdentification],
          identificationTypeId: this.identificationTypeId,
          quantity: item[this.fieldMapping.quantity],
          facilityId: '',
          externalFacilityId: item[this.fieldMapping.facility],
          locationSeqId: item[this.fieldMapping.locationSeqId]
        }
      })
      const params = {
        "configId": "MDM_INV_VARIANCE"
      }
      const alert = await alertController.create({
        header: translate("Adjust Inventory"),
        message: translate("Make sure all the data you have entered is correct."),
        buttons: [
            {
              text: translate("Cancel"),
              role: "cancel",
            },
            {
              text: translate("Upload"),
              handler: () => {
                const data = jsonToCsv(uploadData)
                const formData = new FormData();
                formData.append("uploadedFile", data, this.file.name);

                if(Object.keys(params)) {
                  for(const key in params) {
                    formData.append(key, params[key]);
                  }
                }

                UploadService.uploadAndImportFile({
                  data: formData,
                  headers: {
                    'Content-Type': 'multipart/form-data;'
                  }
                }).then((resp) => {
                  if(hasError(resp)) {
                    throw resp.data
                  }

                  showToast(translate("The inventory has been updated successfully"), [{
                    text: translate("View"),
                    role: "view",
                    handler: () => {
                      const omsURL = (this.instanceUrl.startsWith('http') ? this.instanceUrl.replace(/\/api\/?|\/$/, "") : `https://${this.instanceUrl}.hotwax.io`) + `/commerce/control/ImportData?configId=MDM_INV_VARIANCE`
                      window.open(omsURL, '_blank');
                    }
                  }])
                }).catch(() => {
                  showToast(translate("Something went wrong, please try again"));
                })
              },
            },
          ],
        });
      return alert.present();  
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const userStore = useUserStore()
    let currentEComStore = computed(() => userStore.getCurrentEComStore)

    return {
      router,
      translate,
      addOutline,
      arrowForward,
      cloudUploadOutline,
      currentEComStore,
      informationCircleOutline,
      settingsOutline,
      store,
    }
  } 
})
</script>

<style scoped>
main {
  max-width: 732px;
  margin: var(--spacer-sm) auto 0; 
}

.review {
  margin: var(--spacer-base) var(--spacer-sm);
}

.adjust-buttons ion-button {
  width: 100%;
}

label {
  cursor: pointer;
}
</style>
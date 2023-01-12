<template>
  <ion-content>
    <ion-list>
      <ion-list-header>{{ $t("More options") }}</ion-list-header>
      <ion-item>
        <ion-label>{{ $t("Order ID") }}</ion-label>
        <ion-select interface="popover" :placeholder = "$t('Select')" v-model="fieldMapping.orderId">
          <ion-select-option>{{ mapping.mappin }}</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Shopify product SKU") }}</ion-label>
        <ion-select interface="popover" :placeholder = "$t('Select')" v-model="fieldMapping.productSku">
          <ion-select-option>{{ prop }}</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Arrival date") }}</ion-label>
        <ion-select interface="popover" :placeholder = "$t('Select')" v-model="fieldMapping.orderDate">
          <ion-select-option>{{ prop }}</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Ordered quantity") }}</ion-label>
        <ion-select interface="popover" :placeholder = "$t('Select')" v-model="fieldMapping.quantity">
          <ion-select-option>{{ prop }}</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Facility ID") }}</ion-label>
        <ion-select interface="popover" :placeholder = "$t('Select')" v-model="fieldMapping.facility">
          <ion-select-option>{{ prop }}</ion-select-option>
        </ion-select>
      </ion-item>
    </ion-list>     
  </ion-content>
</template>

<script lang="ts">
import {
  IonContent,
  IonItem,
  IonList,
  IonListHeader,
  alertController,
  modalController,
  popoverController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { copyOutline, flashOutline, pinOutline, timeOutline  } from 'ionicons/icons'
import { mapGetters, useStore } from 'vuex'
import JobHistoryModal from '@/components/JobHistoryModal.vue'
import { Plugins } from '@capacitor/core';
import { showToast } from '@/utils'
import emitter from "@/event-bus"

export default defineComponent({
  name: "UpdateMappingPopover",
  components: { 
    IonContent,
    IonItem,
    IonList,
    IonListHeader
  },
  data() {
    return {
      fieldMapping: {
        orderId: "",
        productSku: "",
        orderDate: "",
        quantity: "",
        facility: ""
      }
    }
  },
  props: ["mapping"],
  computed: {
    ...mapGetters({
      getEnumDescription: 'job/getEnumDescription',
      getEnumName: 'job/getEnumName',
      getPinnedJobs: 'user/getPinnedJobs'
    })
  },
  mounted() {
    this.fieldMapping['orderId'] = this.mapping.orderId
    this.fieldMapping['productSku'] = this.mapping.productSku
    this.fieldMapping['orderDate'] = this.mapping.orderDate
    this.fieldMapping['quantity'] = this.mapping.quantity
    this.fieldMapping['facility'] = this.mapping.facility
  },
  methods: {
    closePopover() {
      popoverController.dismiss({ dismissed: true });
    },
    async copyJobInformation(job: any) {
      const { Clipboard } = Plugins;
      const jobDetails = `jobId: ${job.jobId}, jobName: ${this.getEnumName(job.systemJobEnumId)}, jobDescription: ${this.getEnumDescription(job.systemJobEnumId)}`;

      await Clipboard.write({
        string: jobDetails
      }).then(() => {
        showToast(this.$t("Copied job details to clipboard"));
      })
      this.closePopover();
    },
    async viewJobHistory(job: any) {
      const jobHistoryModal = await modalController.create({
        component: JobHistoryModal,
        componentProps: { currentJob: job }
      });
      await jobHistoryModal.present();
      jobHistoryModal.onDidDismiss().then(() => {
        this.closePopover();
      })
    },
    async updatePinnedJobs(enumId: any) {
      const pinnedJobs = new Set(this.getPinnedJobs);
      if(pinnedJobs.has(enumId)) {
        pinnedJobs.delete(enumId);
        await this.store.dispatch('user/updatePinnedJobs', { pinnedJobs: [...pinnedJobs] });
        emitter.emit("pinnedJobsUpdated", enumId);
      } else {
        pinnedJobs.add(enumId);
        await this.store.dispatch('user/updatePinnedJobs', { pinnedJobs: [...pinnedJobs] });
      }
      this.closePopover();
    },
    async runJobNow(job: any) {
      const alert = await alertController
        .create({
          header: this.$t("Run now"),
          message: this.$t('Running this job now will not replace this job. A copy of this job will be created and run immediately.<br/><br/>You may not be able to reverse this action.'),
          buttons: [
            {
              text: this.$t("Cancel"),
              role: 'cancel',
            },
            {
              text: this.$t('Run now'),
              handler: async () => {
                if(job) {
                  await this.store.dispatch('job/runServiceNow', job)
                  this.closePopover();
                }
              }
            }
          ]
        });
      return alert.present();
    },
  },
  setup() {
    const store = useStore();  

    return {
      copyOutline, 
      flashOutline,
      pinOutline,
      store, 
      timeOutline  
    }
  }
});
</script> 
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-back-button default-href="/unified-inventory" slot="start" />
        <ion-title>{{ translate("Scheduled Incoming Inventory") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <ion-button color="medium" size="large" expand="block" class="review" @click="router.push({ name: 'ScheduledRestock' })">
          {{ translate("Schedule Inventory") }}
          <ion-icon slot="end" :icon="arrowForwardOutline" />
        </ion-button>
  
        <ion-list v-if="jobs.length" class="job-section">
          <template v-if="scheduledJobs.length">
            <ion-list-header>
              <ion-label>{{ translate("Scheduled inventory") }}</ion-label>
              <!-- TODO: we need to discuss and make this button dynamic -->
              <!-- <ion-button>{{ translate("Show completed launches") }}</ion-button> -->
            </ion-list-header>
    
            <ion-item v-for="job in scheduledJobs" :key="job.jobId"> 
              <ion-label>
                <p class="overline">{{ job.jobId }}</p>
                {{ job.jobName }}
                <p>{{ job?.runtimeData?.shipmentId }}</p>
              </ion-label>          
              <ion-button class="date-time-button" @click="changeRunTime(job)">{{ job.runTime ? getTime(job.runTime) : translate("Select time") }}</ion-button>
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
                  :value="currentJob?.runTime ? getDateTime(currentJob.runTime) : getDateTime(DateTime.now().toMillis())"
                  @ionChange="changeJobRunTime($event)"
                />
              </ion-content>
            </ion-modal>
          </template>

          <template v-if="receivedJobs.length">
            <ion-item-divider color="light">
              <ion-label>{{ translate("Received inventory") }}</ion-label>
            </ion-item-divider>
            <ion-item button detail v-for="job in receivedJobs" :key="job.jobId" @click="reviewJobItems(job.jobId)">
              <ion-label>
                <p class="overline">{{ job.jobId }}</p>
                {{ job.jobName }}
                <p>{{ job?.runtimeData?.shipmentId }}</p>
              </ion-label>
              <ion-label slot="end">
                <p>{{ job.runTime ? getTime(job.runTime) : "-" }}</p>
              </ion-label>
            </ion-item>
          </template>
        </ion-list>
        <div v-if="!jobs.length" class="empty-state">
          <p>{{ translate("No jobs are scheduled for incoming inventory") }}</p>
        </div>
      </main>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent } from "vue";
import { translate } from "@hotwax/dxp-components";
import { mapGetters, useStore } from "vuex";
import { useRouter } from 'vue-router';
import { 
  IonBackButton, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonMenuButton, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonList, 
  IonListHeader, 
  IonItem, 
  IonLabel, 
  IonModal, 
  IonDatetime, 
  IonItemDivider, 
  IonIcon, 
  popoverController 
} from '@ionic/vue';
import { arrowForwardOutline, ellipsisVerticalOutline } from "ionicons/icons";
import { DateTime } from 'luxon';
import ScheduledRestockPopover from "@/components/ScheduledRestockPopover.vue"
import { showToast, hasError } from '@/utils';
import { StockService } from "@/services/StockService";
import logger from "@/logger";

export default defineComponent({
  name: "ScheduledIncomingInventory",
  components: {
    IonBackButton,
    IonPage,
    IonHeader,
    IonToolbar,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonButton,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonModal,
    IonDatetime,
    IonItemDivider,
    IonIcon
  },
  data() {
    return {
      currentJob: {},
      isUpdateDateTimeModalOpen: false,
      scheduledJobs: [],
      receivedJobs: []
    }
  },
  computed: {
    ...mapGetters({
      jobs: 'stock/getScheduledJobs',
      userProfile: 'user/getUserProfile',
    })
  },
  async ionViewDidEnter() {
    await this.store.dispatch('stock/fetchJobs')
    this.updateJobsByStatus();
  },
  methods: {
    updateJobsByStatus() {
      this.scheduledJobs = this.jobs.filter(job => job.statusId === "SERVICE_PENDING");
      this.receivedJobs = this.jobs.filter(job => job.statusId === "SERVICE_FINISHED");
    },
    changeRunTime(job) {
      this.currentJob = job
      this.isUpdateDateTimeModalOpen = true
    },
    getTime(time) {
      return DateTime.fromMillis(time, { setZone: true}).toFormat("hh:mm a dd MMM yyyy")
    },
    getDateTime(time) {
      return DateTime.fromMillis(time).toISO()
    },
    async openScheduledRestockPopover(ev, job) {
      const popover = await popoverController.create({
        component: ScheduledRestockPopover,
        event: ev,
        showBackdrop: false,
        componentProps: { job }
      });
      return popover.present();
    },
    reviewJobItems(jobId) {
      this.router.push({ name: 'ScheduledRestockReview', params: { id: jobId } });
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
          this.updateJobsByStatus();
        } else {
          throw resp.data
        }
      } catch (err) {
        showToast(translate('Failed to update job'))
        logger.error(err)
      }
    },
  },

  setup() {
    const router = useRouter();
    const store = useStore();
    return {
      arrowForwardOutline,
      ellipsisVerticalOutline,
      router,
      translate,
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

.review {
  margin: var(--spacer-2xl) var(--spacer-base) var(--spacer-sm);
  height: --spacer-xl;
}

.job-section {
  margin-bottom: 16px;
}
</style>


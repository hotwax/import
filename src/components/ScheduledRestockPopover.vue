<template>
  <ion-content>
    <ion-list>
      <ion-list-header>
        {{ job.jobName || job.jobId }}
      </ion-list-header>
      <ion-item button @click="changeRunTime(job)"> {{ translate("Reschedule") }}
        <ion-modal class="date-time-modal" :is-open="isUpdateDateTimeModalOpen" @didDismiss="() => isUpdateDateTimeModalOpen = false">
          <ion-content force-overscroll="false">
            <ion-datetime    
              id="schedule-datetime"        
              show-default-buttons 
              hour-cycle="h23"
              :min="DateTime.now().toISO()"
              :value="job.runTime ? getDateTime(job.runTime) : getDateTime(DateTime.now().toMillis())"
              @ionChange="changeJobRunTime($event)"
            />
          </ion-content>
        </ion-modal>
      </ion-item>
      <ion-item button @click="cancelJob">
        {{ translate("Cancel") }}
      </ion-item>
      <ion-item button @click="reviewJobItems" lines="none">
        {{ translate("View details") }}
      </ion-item>
    </ion-list>
  </ion-content>
</template>
    
<script>
import logger from "@/logger";
import { StockService } from "@/services/StockService";
import { hasError, showToast } from "@/utils";
import { translate } from "@hotwax/dxp-components";
import {
  IonContent,
  IonDatetime,
  IonItem,
  IonList,
  IonListHeader,
  IonModal,
  popoverController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { useStore, mapGetters } from "vuex";
import { useRouter } from "vue-router";
import { DateTime } from 'luxon';
  
export default defineComponent({
  name: "ScheduledRestockPopover",
  data() {
    return {
      currentJob: {},
      isUpdateDateTimeModalOpen: false,
    }
  },
  computed: {
    ...mapGetters({
      userProfile: 'user/getUserProfile'
    })
  },
  components: {
    IonContent,
    IonDatetime,
    IonItem,
    IonList,
    IonListHeader,
    IonModal
  },
  props: ["job"],
  methods: {
    reviewJobItems() {
      popoverController.dismiss()
      this.router.push({ name: 'ScheduledRestockReview', params: { id: this.job.jobId } });
    },
    async cancelJob() {
      let resp;
      try {
        resp = await StockService.cancelJob({
          jobId: this.job.jobId
        });
        if (resp.status == 200 && !hasError(resp)) {
          showToast(translate('Service updated successfully'))
          await this.store.dispatch('stock/fetchJobs')
        } else {
          throw resp.data;
        }
      } catch (err) {
        showToast(translate('Failed to cancel job'))
        logger.error(err)
      }
      popoverController.dismiss();
      return resp;
    },
    changeRunTime(job) {
      this.currentJob = job
      this.isUpdateDateTimeModalOpen = true
    },
    getDateTime(time) {
      return DateTime.fromMillis(time).toISO()
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
        } else {
          throw resp.data
        }
      } catch (err) {
        showToast(translate('Failed to update job'))
        logger.error(err)
      }
      popoverController.dismiss();
    },
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      store,
      router,
      translate
    }
  },
});
</script>
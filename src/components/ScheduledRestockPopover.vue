<template>
  <ion-content>
    <ion-list>
      <ion-list-header>
        {{ job.jobName || job.jobId }}
      </ion-list-header>
      <ion-item button>
        Reschedule
      </ion-item>
      <ion-item button @click="cancelJob()" lines="none">
        Cancel
      </ion-item>
    </ion-list>
  </ion-content>
</template>
    
<script lang="ts">
import logger from "@/logger";
import { StockService } from "@/services/StockService";
import { hasError, showToast } from "@/utils";
import { translate } from "@hotwax/dxp-components";
import {
  IonContent,
  IonItem,
  IonList,
  IonListHeader
} from "@ionic/vue";
import { defineComponent } from "vue";
import { useStore } from "vuex";
  
export default defineComponent({
  name: "ScheduledRestockPopover",
  components: {
    IonContent,
    IonItem,
    IonList,
    IonListHeader
  },
  props: ["job"],
  methods: {
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
      return resp;
    },
  },

  setup() {
    const store = useStore();
    return {
      store
    }
  },
});
  </script>
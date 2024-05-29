<template>
  <ion-content>
    <ion-list>
      <ion-list-header>
        jobname
      </ion-list-header>
      <ion-item button>
        Reschedule
      </ion-item>
      <ion-item button>
        Cancel
      </ion-item>
    </ion-list>
  </ion-content>
</template>
    
<script lang="ts">
import {
  IonContent,
  IonItem,
  IonList,
  IonListHeader
} from "@ionic/vue";
import { defineComponent } from "vue";
  
export default defineComponent({
  name: "ScheduledRestockPopover",
  components: {
    IonContent,
    IonItem,
    IonList,
    IonListHeader
  },

  setup() {
    
    return {
    }
  },
});
  </script>
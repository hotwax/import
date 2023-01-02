<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/purchase-order" />
        <ion-title>{{ $t("Review PO details") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon slot="icon-only" :icon="checkboxOutline" />
          </ion-button>
          <ion-button>
            <ion-icon :icon="arrowUndoOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="header">
        <div class="search">
          <ion-searchbar :placeholder="$t('Search products')" />
        </div>

        <div class="filters">
          <ion-item @click="bulkAdjustmentModal()"> 
            <ion-icon slot="start" :icon="calculatorOutline" />
            <ion-label>{{ $t("Bulk adjustment") }}</ion-label>
            <ion-note slot="end">50 {{ $t("items selected") }}</ion-note>
            <ion-icon slot="end" :icon="chevronForwardOutline" />
          </ion-item>

          <ion-item @click="dateTimeParseErrorModal()">
            <ion-icon slot="start" :icon="timeOutline" />
            <ion-label>{{ $t("Date time parse error") }}</ion-label>
            <ion-note slot="end">20 {{ $t("items") }}</ion-note>
            <ion-icon slot="end" :icon="chevronForwardOutline" />
          </ion-item>

          <ion-item @click="missingFacilityModal()">
            <ion-icon slot="start" :icon="businessOutline" />
            <ion-label>{{ $t("Missing facilities") }}</ion-label>
            <ion-note slot="end">10 {{ $t("items") }}</ion-note>
            <ion-icon slot="end" mode="ios" :icon="chevronForwardOutline" />
          </ion-item>

          <ion-item>
            <ion-icon slot="start" :icon="shirtOutline" />
            <ion-label>{{ $t("Missing products") }}</ion-label>
            <ion-note slot="end">23 {{ $t("items") }}</ion-note>
            <ion-icon slot="end" :icon="chevronForwardOutline" />
          </ion-item>
        </div>
      </div>

      <div v-if="segmentSelected === 'all'">
        <PODetails />
      </div>
      <div v-if="segmentSelected === 'po1'">
        <PODetails />
      </div>
      <div v-if="segmentSelected === 'po2'">
        <PODetails />
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button>
          <ion-icon :icon="cloudUploadOutline" />
        </ion-fab-button>
      </ion-fab>
      <div id="segment">
        <ion-segment v-model="segmentSelected">
          <ion-segment-button value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button value="po1">
            <ion-label>PO1</ion-label>
          </ion-segment-button>
          <ion-segment-button value="po2">
            <ion-label>PO2</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>
    </ion-content>  
  </ion-page>
</template>   
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useStore } from "vuex";
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonBackButton, IonTitle, IonContent, IonSearchbar, IonItem, IonLabel, IonIcon, IonButton, IonButtons, IonFab, IonFabButton, IonSegment, IonSegmentButton, IonNote, alertController, modalController } from '@ionic/vue'
import { ellipsisVerticalOutline, businessOutline, shirtOutline, sendOutline, checkboxOutline, calculatorOutline, cloudUploadOutline, arrowUndoOutline, chevronForwardOutline, timeOutline } from 'ionicons/icons'
import PODetails from '@/components/PODetail.vue'
import DateTimeParseErrorModal from '@/components/DateTimeParseErrorModal.vue';
import BulkAdjustmentModal from '@/components/BulkAdjustmentModal.vue';
import MissingFacilityModal from '@/components/MissingFacilitiesModal.vue';

export default defineComponent({
  name: 'PurchaseOrderDetail',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonItem,
    IonLabel,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonNote,
    IonButton,
    IonButtons,
    IonFab,
    IonFabButton,
    PODetails
  },
  data() {
    return {}
  },
  methods: {
    async dateTimeParseErrorModal() {
      const dateTimeParseErrorModal = await modalController.create({
        component: DateTimeParseErrorModal,
        componentProps: { }
      });
      return dateTimeParseErrorModal.present();
    },
    async bulkAdjustmentModal() {
      const bulkAdjustmentModal = await modalController.create({
        component: BulkAdjustmentModal,
        componentProps: { }
      });
      return bulkAdjustmentModal.present();
    },
    async missingFacilityModal() {
      const missingFacilityModal = await modalController.create({
        component: MissingFacilityModal,
        componentProps: { }
      });
      return missingFacilityModal.present();
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const segmentSelected = ref('all');
    
    return {
      checkboxOutline,
      calculatorOutline,
      ellipsisVerticalOutline,
      sendOutline,
      arrowUndoOutline,
      businessOutline,
      cloudUploadOutline,
      chevronForwardOutline,
      timeOutline,
      shirtOutline,
      segmentSelected,
      router,
      store,
    }
  }
});

</script>

<style scoped>
  .header {
    margin-bottom: var(--spacer-sm);
    padding: var(--spacer-sm);
  }
  
  .filters > ion-button {
    margin-top: var(--spacer-sm);
  }

  #segment {
    width: 40%;
    bottom: 0px;
    margin-top: 10px;
    border-radius: 0px 4px 0px 0px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.14), 0px 4px 5px rgba(0, 0, 0, 0.12), 0px 1px 10px rgba(0, 0, 0, 0.2);
  }
  
  @media (min-width: 991px) {
    .header {
      display: grid;
      grid: "search filters"
            /1fr 1fr;
      gap: var(--spacer-sm);
    }
  
    .search {
      grid-area: search;
    } 
  
    .filters {
      grid-area: filters;
    }
  }
</style>
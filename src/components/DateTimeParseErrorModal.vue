<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Date time parse error") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-item lines="none">
      <ion-label>
        <p class="overline">{{ $t("File upload") }}</p>
        <h1>{{ $t("Date format") }}</h1> 
        <p class="ion-text-wrap">{{ $t("Enter a custom date time format that you want to use when uploading documents to HotWax Commerce.") }}</p>
      </ion-label>
    </ion-item>
    
    <ion-item>
      <ion-input clear-input='true' v-model="dateTimeFormat" :value="dateTimeFormat" :placeholder="defaultDateTimeFormat" />
    </ion-item>
    
    <ion-item>
      <ion-label>{{ sampleDateTime }}</ion-label>
      <ion-badge color="warning">{{ $t("Sample") }}</ion-badge>
    </ion-item>

    <ion-button class="ion-margin-top ion-margin-start" fill="outline" @click="parse">
      {{ $t("Check sample") }}
    </ion-button>
    
    <ion-item lines="none">
      <ion-label color="medium">{{ $t("This will update 50 products across 3 POs") }}</ion-label>
    </ion-item>
    
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="updateDateTimeFormat">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>
<script lang="ts">
import { 
  IonBadge,  
  IonButtons,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonItem,
  IonIcon,
  IonInput,
  IonLabel,
  IonTitle,
  IonToolbar,
  modalController,
} from "@ionic/vue";
import { defineComponent } from "vue";
import { close, saveOutline } from "ionicons/icons";
import { useStore } from "@/store";
import { mapGetters } from "vuex";
import { DateTime } from "luxon";
import { showToast } from "@/utils";
import { translate } from "@/i18n";
export default defineComponent({
  name: "DateTimeParseErrorModal",
  components: {
    IonBadge,   
    IonButtons,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonInput,
    IonLabel,
    IonTitle,
    IonToolbar 
  },
  data() {
    return { 
      sampleDateTime: '',
      dateTimeFormat: '',
      defaultDateTimeFormat: process.env.VUE_APP_DATE_FORMAT ? process.env.VUE_APP_DATE_FORMAT : 'MM/dd/yyyy'
    }
  },
  computed: {
    ...mapGetters({
      currentDateTimeFormat: 'user/getDateTimeFormat'
    })
  },
  mounted(){
    this.dateTimeFormat = this.currentDateTimeFormat
    this.parse();
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    updateDateTimeFormat(){
      this.dateTimeFormat = this.dateTimeFormat ? this.dateTimeFormat : this.defaultDateTimeFormat
      this.store.dispatch('user/setDateTimeFormat', this.dateTimeFormat);
      this.parse();
      modalController.dismiss({ dismissed: true });
      showToast(translate("Date time format has been updated successfully"));

    },
    parse(){
      this.sampleDateTime = DateTime.now().toFormat(this.dateTimeFormat);
    },
  },
  setup() {
    const store = useStore();
    return {
      close,
      saveOutline,
      store
    };
  },
});
</script>
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
      <p>
        <ion-note class="overline">{{ $t("File upload") }}</ion-note>
        <ion-label>{{ $t("Date format") }}</ion-label> 
      </p>
    </ion-item>

    <ion-list>
      <ion-list-header>
        <ion-label color="medium">
          {{ $t("Enter a custom date time format that you want to use when uploading documents to HotWax Commerce.") }}
        </ion-label>
      </ion-list-header>
        
      <ion-item>
        <ion-input clear-input='true' value="DD/MM/YYYY" />
      </ion-item>

      <ion-item >
        <ion-label>02/02/2022</ion-label>
        <ion-badge color="warning">{{ $t("Sample") }}</ion-badge>
      </ion-item>
    </ion-list>

    <ion-button class="ion-padding-start" fill="outline">
      {{ $t("Check sample") }}
    </ion-button>

    <ion-item lines="none">
      <ion-label color="medium">{{ $t("This will update 50 products across 3 POs") }}</ion-label>
    </ion-item>
    
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
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
  props: [""],
  data() {
    return { }
  },
  computed: { },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    }
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
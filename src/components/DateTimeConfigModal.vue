<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Configure date time format") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    
    <ion-item>
      <ion-label color="medium">{{ $t("CSV input") }}</ion-label>
      <ion-label slot="end">{{ arrivalDate }}</ion-label>
    </ion-item> 
    <ion-item>
      <ion-label color="medium">{{ $t("Expected input") }}</ion-label>
      <ion-label slot="end">{{ currentDate }}</ion-label>
    </ion-item>
    <ion-item lines="full">
      <ion-label>{{ $t("Custom date format") }}</ion-label>
      <ion-input clear-input='true' @keyup.enter="dateTimeFormat = $event.target.value;" v-model="dateTimeFormat" :value="dateTimeFormat" :placeholder="defaultDateTimeFormat" />
    </ion-item>

    <ion-item class="ion-padding-bottom" lines="none">
      <a href="https://moment.github.io/luxon/#/formatting?id=table-of-tokens" target="_blank">{{ $t('View all date time formats supported by the HotWax Import app.') }}</a>
    </ion-item>
          
    <ion-item class="ion-padding-bottom">
      <ion-label color="medium">{{ $t("Parsed output") }}</ion-label>
      <ion-label slot="end">{{ isDateInvalid(arrivalDate) ? $t("Invalid input") : arrivalDate }}</ion-label>
      <ion-icon slot="end" color="danger" v-if="isDateInvalid(arrivalDate)" :icon="warningOutline"></ion-icon>
    </ion-item>

    <ion-note class="ion-text-wrap ion-padding">{{ $t("Changes to the date time format will cause edits done to your PO to be reverted.") }}</ion-note>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="save()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script lang="ts">
import { 
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
  IonNote,
  IonTitle,
  IonToolbar,
  modalController,
  alertController } from "@ionic/vue";
import { defineComponent } from "vue";
import { close, saveOutline } from "ionicons/icons";
import { mapGetters } from 'vuex';
import { DateTime } from 'luxon';
import { warningOutline } from 'ionicons/icons'
import { useStore } from "@/store";

export default defineComponent({
  name: "DateTimeConfigModal",
  props: ["arrivalDate"],
  data() {
    return {
      currentDate: '',
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
    this.currentDate = DateTime.now().toFormat(this.dateTimeFormat)
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    async save() {
      const message = this.$t("Are you sure you want to change the date time format?");
      const alert = await alertController.create({
        header: this.$t("Update date time format"),
        message,
        buttons: [
          {
            text: this.$t("Cancel"),
          },
          {
            text: this.$t("Confirm"),
            handler: () => {
              this.updateDateTimeFormat();
            }
          }
        ],
      });
      return alert.present();
    },
    isDateInvalid(date: string) {
      return !DateTime.fromFormat(date, this.dateTimeFormat).isValid
    },
    updateDateTimeFormat(){
      this.dateTimeFormat = this.dateTimeFormat ? this.dateTimeFormat : this.defaultDateTimeFormat
      this.store.dispatch('user/setDateTimeFormat', this.dateTimeFormat).then(() => this.closeModal());
    },
  },
  setup() {
    const store = useStore();
    return {
      close,
      saveOutline,
      store,
      warningOutline
    };
  },
  components: { 
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
    IonNote,
    IonTitle,
    IonToolbar 
    },
});
</script>

<style scoped>
a {
  text-decoration: none;
}
</style>
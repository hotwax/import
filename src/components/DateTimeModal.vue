<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Select datetime format") }}</ion-title>
    </ion-toolbar>
    <ion-toolbar>
      <ion-searchbar :value="dateTimeFormat" @ionFocus="selectSearchBarText($event)" :placeholder="$t('Enter format')"  v-model="format" v-on:keyup.enter="format = $event.target.value;"></ion-searchbar>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    
    <div>
      {{ sampleDateTime }}
    </div>
    
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="setDateTimeFormat">
        <ion-icon :icon="save" />
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
  IonLabel,
  IonRadioGroup,
  IonRadio,
  IonList,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  modalController,
  alertController } from "@ionic/vue";
import { defineComponent } from "vue";
import { close, save } from "ionicons/icons";
import { useStore } from "@/store";
import { UserService } from "@/services/UserService";
import { hasError } from '@/utils'
import { DateTime } from 'luxon';
import { mapGetters } from "vuex";

export default defineComponent({
  name: "TimeZoneModal",
  data() {
    return {
      queryString: '',
      filteredTimeZones: [],
      timeZones: [],
      timeZoneId: '',
      sampleDateTime: '',
      format: ''
    }
  },
  computed: {
    ...mapGetters({
      dateTimeFormat: 'user/getDateTimeFormat'
    })
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },

    async setDateTimeFormat(){
      this.sampleDateTime = DateTime.now().toFormat(this.format);
      return this.store.dispatch('user/setDateTimeFormat', this.format).then(() => {
        this.closeModal();
      })
    },
    
    selectSearchBarText(event: any) {
      event.target.getInputElement().then((element: any) => {
        element.select();
      })
    },
    
  },
  mounted(){
      this.format = this.dateTimeFormat
  },
  setup() {
    const store = useStore();
    return {
      close,
      save,
      store
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
    IonSearchbar,
    IonTitle,
    IonToolbar 
    },
});
</script>

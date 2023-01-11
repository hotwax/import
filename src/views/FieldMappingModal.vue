<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Mappings") }}</ion-title>
    </ion-toolbar>
    <ion-toolbar>
      <ion-searchbar @ionFocus="selectSearchBarText($event)" :placeholder="$t('Search mapping')"  v-model="queryString" v-on:keyup.enter="queryString = $event.target.value; findTimeZone()"></ion-searchbar>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <!-- Empty state -->
    <div class="empty-state" v-if="fieldMappings.length === 0">
      <p>{{ $t("No fieldMapping found. Please create new.")}}</p>
    </div>

    <!-- Mappings -->
    <div v-else>
      <ion-list>
        <ion-item :key="mapping.mappingPrefId" v-for="mapping in fieldMappings">
          <ion-label>{{ mapping?.mappingPrefName }}</ion-label>
          <!-- <ion-icon @click="saveMapping" slot="end" :icon="pencilOutline" /> -->
          <ion-icon @click="deleteMapping(mapping)" slot="end" :icon="trashOutline" />
        </ion-item>
      </ion-list>
    </div>
  </ion-content>
</template>

<script lang="ts">
import { 
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonItem,
  IonList,
  modalController,
} from "@ionic/vue";
import { defineComponent } from "vue";
import { close, save, trashOutline } from "ionicons/icons";
import { useStore, mapGetters } from "vuex";
import { UserService } from "@/services/UserService";
import { hasError } from '@/utils'
import { DateTime } from 'luxon';

export default defineComponent({
  name: "FieldMappingModal",
  data() {
    return {
      queryString: '',
      filteredTimeZones: [],
      timeZones: [],
      timeZoneId: ''
    }
  },
  computed: {
    ...mapGetters({
      fieldMappings: 'user/getFieldMappings'
    })
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    // async saveAlert() {
    //   const message = this.$t("Are you sure you want to change the time zone to?", { timeZoneId: this.timeZoneId });
    //   const alert = await alertController.create({
    //     header: this.$t("Update time zone"),
    //     message,
    //     buttons: [
    //         {
    //           text: this.$t("Cancel"),
    //         },
    //         {
    //           text: this.$t("Confirm"),
    //           handler: () => {
    //             this.setUserTimeZone();
    //             }
    //           }
    //         ],
    //   });
    //   return alert.present();
    // },
    escapeRegExp(text: string) {
      //TODO Handle it in a better way
      // Currently when the user types special character as it part of Regex expressions it breaks the code
      // so removed the characters for now
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    },
    findTimeZone() { 
      const regularExp = new RegExp(`${this.escapeRegExp(this.queryString)}`, 'i');
      this.filteredTimeZones = this.timeZones.filter((timeZone: any) => {
        return regularExp.test(timeZone.id) || regularExp.test(timeZone.label);
      });
    },
    async getAvailableTimeZones() {
      UserService.getAvailableTimeZones().then((resp: any) => {
        if (resp.status === 200 && !hasError(resp)) {
           this.timeZones = resp.data.filter((timeZone: any) => {
              return DateTime.local().setZone(timeZone.id).isValid;
          });
          this.findTimeZone();
        }
      })
    },
    selectSearchBarText(event: any) {
      event.target.getInputElement().then((element: any) => {
        element.select();
      })
    },
    async deleteMapping(mapping: any) {
      return this.store.dispatch("user/deleteFieldMapping", {
          mappingPrefId: mapping.mappingPrefId
      }).then(() => {
        this.closeModal()
      }) 
    }
  },
  beforeMount () {
    this.getAvailableTimeZones();
  },
  setup() {
    const store = useStore();
    return {
      close,
      save,
      trashOutline,
      store
    };
  },
  components: { 
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonItem,
    IonList
    },
});
</script>

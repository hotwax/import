<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Select time zone") }}</ion-title>
    </ion-toolbar>
    <ion-toolbar>
      <ion-searchbar @ionFocus="selectSearchBarText($event)" :placeholder="$t('Search time zones')" v-model="queryString" @ionChange="findTimeZone()" @keydown="preventSpecialCharacters($event)" />
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <form @keyup.enter="setUserTimeZone">
      <!-- Empty state -->
      <div class="empty-state" v-if="isLoading">
        <ion-item lines="none">
          <ion-spinner color="secondary" name="crescent" slot="start" />
          {{ $t("Fetching time zones") }}
        </ion-item>
      </div>

      <div class="empty-state" v-else-if="filteredTimeZones.length === 0">
        <p>{{ $t("No time zone found") }}</p>
      </div>

      <!-- Timezones -->
      <div v-else>
        <ion-list>
          <ion-radio-group value="rd" v-model="timeZoneId">
            <ion-item :key="timeZone.id" v-for="timeZone in filteredTimeZones">
              <ion-radio label-placement="end" justify="start" :value="timeZone.id">{{ timeZone.label }} ({{ timeZone.id }})</ion-radio>
            </ion-item>
          </ion-radio-group>
        </ion-list>
      </div>
    </form>

    <!-- Defined ion-fab outside of form element as the fab button losoe its styling when wrapped inside form -->
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button :disabled="!timeZoneId" @click="setUserTimeZone">
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
  IonList,
  IonRadioGroup,
  IonRadio,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { close, save } from "ionicons/icons";
import { useStore } from "@/store";
import { UserService } from "@/services/UserService";
import { hasError } from '@/utils'
import { DateTime } from 'luxon';

export default defineComponent({
  name: "TimeZoneModal",
  components: { 
    IonButtons,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonList,
    IonRadioGroup,
    IonRadio,
    IonSearchbar,
    IonSpinner,
    IonTitle,
    IonToolbar 
  },
  data() {
    return {
      queryString: '',
      filteredTimeZones: [],
      timeZones: [],
      timeZoneId: '',
      isLoading: false
    }
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    preventSpecialCharacters($event: any) {
      // Searching special characters fails the API, hence, they must be omitted
      if(/[`!@#$%^&*()_+\-=\\|,.<>?~]/.test($event.key)) $event.preventDefault();
    },
    findTimeZone() { 
      const queryString = this.queryString.toLowerCase();
      this.filteredTimeZones = this.timeZones.filter((timeZone: any) => {
        return timeZone.id.toLowerCase().match(queryString) || timeZone.label.toLowerCase().match(queryString);
      });
    },
    async getAvailableTimeZones() {
      this.isLoading = true;
      try {
        const resp = await UserService.getAvailableTimeZones()
        if(resp.status === 200 && !hasError(resp)) {
          // We are filtering valid the timeZones coming with response here
          this.timeZones = resp.data.filter((timeZone: any) => {
            return DateTime.local().setZone(timeZone.id).isValid;
          });
          this.findTimeZone();
        }
      } catch(err) {
        console.error(err)
      }
      this.isLoading = false;
    },
    async selectSearchBarText(event: any) {
      const element = await event.target.getInputElement()
      element.select();
    },
    async setUserTimeZone() {
      await this.store.dispatch("user/setUserTimeZone", {
        "tzId": this.timeZoneId
      })
      this.closeModal()
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
      store
    };
  }
});
</script>
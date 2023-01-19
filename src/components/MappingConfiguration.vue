<template>
  <section>
    <!-- Empty state -->
    <!-- <div class="empty-state" v-if="Object.keys(currentMapping).length === 0">
      <p>{{ $t("No fieldMapping found. Please create new.")}}</p>
    </div> -->

    <!-- Mappings -->
      <ion-item>
        <ion-label>{{ $t("Mapping name") }}</ion-label>
        <ion-input :placeholder="currentMapping.mappingPrefName" v-model="mappingName" />
      </ion-item>

      <ion-list>
        <ion-item>
          <ion-label>{{ $t("Order ID") }}</ion-label>
          <ion-input :placeholder="currentMapping.orderId" />
        </ion-item>

        <ion-item>
          <ion-label>{{ $t("Shopify product SKU") }}</ion-label>
          <ion-input :placeholder="currentMapping.orderId" />
        </ion-item>

        <ion-item>
          <ion-label>{{ $t("Arrival date") }}</ion-label>
          <ion-input :placeholder="currentMapping.orderId" />
        </ion-item>

        <ion-item>
          <ion-label>{{ $t("Ordered quantity") }}</ion-label>
          <ion-input :placeholder="currentMapping.orderId" />
        </ion-item>

        <ion-item>
          <ion-label>{{ $t("Facility ID") }}</ion-label>
          <ion-input :placeholder="currentMapping.orderId" />
        </ion-item>
      </ion-list>

      <ion-button>
        <ion-icon :icon="saveOutline"/>
        {{ $t("SAVE CHANGES") }}
      </ion-button>
      <ion-button fill="outline" color="danger">
        <ion-icon :iocn="trashOutline" color="danger" />
        {{ $t("DELETE MAPPING") }}
      </ion-button>
</section>
</template>

<script lang="ts">
import { 
  IonButton,
  IonIcon,
  IonInput,
  IonLabel,
  IonItem,
  IonList,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { close, save, saveOutline, trashOutline } from "ionicons/icons";
import { useStore, mapGetters } from "vuex";
import { UserService } from "@/services/UserService";
import { hasError } from '@/utils'
import { DateTime } from 'luxon';
import { showToast } from '@/utils';
import { translate } from "@/i18n";

export default defineComponent({
  name: "MappingConfiguration",
  data() {
    return {
      mappingName: "",
      queryString: '',
      filteredTimeZones: [],
      timeZones: [],
      timeZoneId: ''
    }
  },
  computed: {
    ...mapGetters({
      fieldMappings: 'user/getFieldMappings',
      currentMapping: 'user/getCurrentMapping'
    })
  },
  mounted() {
    this.mapFields(this.currentMapping)
  },
  methods: {
    generateUniqueMappingPrefId(): any {
      const id = Math.floor(Math.random() * 1000);
      return !this.fieldMappings[id] ? id : this.generateUniqueMappingPrefId();
    },
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
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
    },
    async setFieldMapping() {
      console.log("Set");
      
    },
    mapFields(mapping: any) {
      console.log("Set");
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
      saveOutline,
      trashOutline,
      store
    };
  },
  components: { 
    IonButton,
    IonIcon,
    IonInput,
    IonLabel,
    IonItem,
    IonList
  },
});
</script>

<style>
@media (min-width: 991px) {
  main {
    display: flex;
    justify-content: center;
    align-items: start;
    gap: var(--spacer-2xl);
    max-width: 990px;
    margin: var(--spacer-base) auto 0;
  }

  main > section {
    max-width: 50ch;
  }

  .desktop-only {
    display: unset;
  }

  .mobile-only {
    display: none;
  }

  aside {
    width: 0px;
    opacity: 0;
  }
}
</style>
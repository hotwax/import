<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("CSV Mapping") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-item>
    <ion-label>{{ $t("Mapping name") }}</ion-label>
    <ion-input v-model="mappingName" />
  </ion-item>

  <ion-content class="ion-padding">
    <!-- Empty state -->
    <div class="empty-state" v-if="fieldMappings.length === 0">
      <p>{{ $t("No fieldMapping found. Please create new.")}}</p>
    </div>

    <!-- Mappings -->
    <div v-else>
      <ion-list>
        <ion-item>
          <ion-label>{{ $t("Order ID") }}</ion-label>
          <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fieldMappings.orderId">
            <ion-select-option :key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>{{ $t("Shopify product SKU") }}</ion-label>
          <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fieldMappings.productSku">
            <ion-select-option :key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>{{ $t("Arrival date") }}</ion-label>
          <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fieldMappings.orderDate">
            <ion-select-option :key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>{{ $t("Ordered quantity") }}</ion-label>
          <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fieldMappings.quantity">
            <ion-select-option :key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>{{ $t("Facility ID") }}</ion-label>
          <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fieldMappings.facility">
            <ion-select-option :key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
    </div>
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="saveMapping">
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
  IonHeader,
  IonIcon,
  IonFab,
  IonFabButton,
  IonInput,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { close, save, saveOutline } from "ionicons/icons";
import { useStore, mapGetters } from "vuex";
import { showToast } from '@/utils';
import { translate } from "@/i18n";

export default defineComponent({
  name: "FieldMappingModal",
  data() {
    return {
      mappingName: "",
      queryString: '',
      filteredTimeZones: [],
      timeZones: [],
      timeZoneId: '',
      fieldMappings: {}
    }
  },
  props: ["content", "fieldMapping"],
  computed: {
    ...mapGetters({
      fieldMappings: 'user/getFieldMappings'
    })
  },
  mounted() {
    this.fieldMappings = this.fieldMapping;
  },
  methods: {
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
    async saveMapping() {
      if(!this.mappingName) {
        showToast(translate("Enter mapping name"));
        return
      }
      if (!this.areAllFieldsSelected()) {
        showToast(translate("Map all fields"));
        return
      }
      const mappingPrefId = this.generateUniqueMappingPrefId();
      return this.store.dispatch("user/createFieldMapping", { mappingPrefId, mappingPrefName: this.mappingName, mappingPrefValue: JSON.parse(JSON.stringify(this.fieldMapping)) }).then(() => {
        showToast(translate("Mapping saved successfully"));
        this.closeModal()
      })
    },
    areAllFieldsSelected() {
      return Object.values(this.fieldMapping).every(field => field !== "");
    },
    generateUniqueMappingPrefId(): any {
      const id = Math.floor(Math.random() * 1000);
      return !this.fieldMappings[id] ? id : this.generateUniqueMappingPrefId();
    }
  },
  setup() {
    const store = useStore();
    return {
      close,
      save,
      saveOutline,
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
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonItem,
    IonList
    },
});
</script>

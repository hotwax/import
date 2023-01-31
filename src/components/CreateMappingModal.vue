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
    <ion-input :placeholder="$t('Field mapping name')" v-model="mappingName" />
  </ion-item>

  <ion-content class="ion-padding">
    <div>
      <ion-list>
        <ion-item>
          <ion-label>{{ $t("Order ID") }}</ion-label>
          <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fieldMapping.orderId">
            <ion-select-option :key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>{{ $t("Shopify product SKU") }}</ion-label>
          <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fieldMapping.productSku">
            <ion-select-option :key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>{{ $t("Arrival date") }}</ion-label>
          <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fieldMapping.orderDate">
            <ion-select-option :key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>{{ $t("Ordered quantity") }}</ion-label>
          <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fieldMapping.quantity">
            <ion-select-option :key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>{{ $t("Facility ID") }}</ion-label>
          <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fieldMapping.facility">
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
  data() {
    return {
      mappingName: "",
      fieldMapping: {
        orderId: "",
        productSku: "",
        orderDate: "",
        quantity: "",
        facility: "",
      }
    }
  },
  props: ["content", "seletedFieldMapping"],
  mounted() {
    this.fieldMapping = { ...this.seletedFieldMapping }
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
    async saveMapping() {
      if(!this.mappingName) {
        showToast(translate("Enter mapping name"));
        return
      }
      if (!this.areAllFieldsSelected()) {
        showToast(translate("Map all fields"));
        return
      }
      const id = this.generateUniqueMappingPrefId();
      return this.store.dispatch("user/createFieldMapping", { id, name: this.mappingName, value: this.fieldMapping }).then(() => {
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
  }
});
</script>
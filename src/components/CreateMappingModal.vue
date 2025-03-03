<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal()">
          <ion-icon :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("CSV Mapping") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-item>
    <ion-input :label="translate('Mapping name')" :placeholder="translate('Field mapping name')" v-model="mappingName" />
  </ion-item>

  <ion-content class="ion-padding">
    <div>
      <ion-list>
        <ion-item :key="field" v-for="(fieldValues, field) in getFields()">
          <template v-if="field === 'productIdentification'">
            <ion-select aria-label="identification-type-id" interface="popover" :placeholder = "translate('Select')" v-model="identificationTypeId">
              <ion-select-option :key="goodIdentificationType.goodIdentificationTypeId" v-for="goodIdentificationType in goodIdentificationTypes">{{ goodIdentificationType.description }}</ion-select-option>
            </ion-select>
            <ion-select aria-label="identification-type-value" interface="popover" v-if="content.length" :placeholder = "translate('Select')" slot="end" v-model="fieldMapping['productIdentification']">
              <ion-select-option :key="index" v-for="(prop, index) in fileColumns">{{ prop }}</ion-select-option>
            </ion-select>
          </template>
          <template v-else>
            <ion-select :label="translate(fieldValues.label)" interface="popover" :placeholder = "translate('Select')" v-model="fieldMapping[field]">
              <ion-select-option :key="index" v-for="(prop, index) in fileColumns">{{ prop }}</ion-select-option>
            </ion-select>
          </template>
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
import { translate } from "@hotwax/dxp-components";

export default defineComponent({
  name: "CreateMappingModal",
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
    IonItem,
    IonList
  },
  data() {
    return {
      mappingName: "",
      fieldMapping: {} as any,
      fileColumns: [] as any,
      identificationTypeId: 'SKU'
    }
  },
  props: ["content", "seletedFieldMapping", "mappingType"],
  mounted() {
    this.fieldMapping = { ...this.seletedFieldMapping }
    this.fileColumns = Object.keys(this.content[0]);
    this.store.dispatch('util/fetchGoodIdentificationTypes');
  },
  computed: {
    ...mapGetters({
      fieldMappings: 'user/getFieldMappings',
      goodIdentificationTypes: 'util/getGoodIdentificationTypes'
    })
  },
  methods: {
    getFields() {
      const fields = process.env["VUE_APP_MAPPING_" + this.mappingType];
      return fields ? JSON.parse(fields) : {};
    },
    closeModal(mappingId = "") {
      modalController.dismiss({ dismissed: true, mappingId });
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
      const mappingPrefId = await this.store.dispatch("user/createFieldMapping", { name: this.mappingName, value: this.fieldMapping, mappingType: this.mappingType })
      this.closeModal(mappingPrefId);
    },
    areAllFieldsSelected() {
      return Object.values(this.fieldMapping).every(field => field !== "");
    },
  },
  setup() {
    const store = useStore();
    return {
      close,
      save,
      saveOutline,
      store,
      translate
    };
  }
});
</script>
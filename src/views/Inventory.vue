<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Inventory") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <ion-item>
          <ion-label>{{ $t("Inventory") }}</ion-label>
          <ion-label class="ion-text-right ion-padding-end">{{ file.name }}</ion-label>
          <input @change="parse" ref="file" class="ion-hide" type="file" id="inputFile"/>
          <label for="inputFile">{{ $t("Upload") }}</label>
        </ion-item>      

        <ion-list>
          <ion-list-header>{{ $t("Select the column index for the following information in the uploaded CSV.") }}</ion-list-header>

          <ion-item>
            <ion-label>{{ $t("Product SKU") }}</ion-label>
            <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fieldMapping.productSku">
              <ion-select-option :key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Quantity") }}</ion-label>
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

          <ion-item>
            <ion-label>{{ $t("Facility Location") }}</ion-label>
            <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fieldMapping.locationSeqId">
              <ion-select-option :key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-list>

        <ion-button color="medium" @click="mapFields" expand="block">
          {{ $t("Review") }}
          <ion-icon slot="end" :icon="arrowForwardOutline" />
        </ion-button>
      </main>
    </ion-content>
  </ion-page>
</template>
<script>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonList, IonListHeader, IonMenuButton, IonButton, IonSelect, IonSelectOption, IonIcon } from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from 'vue-router';
import { useStore, mapGetters } from "vuex";
import { showToast } from '@/utils';
import { translate } from "@/i18n";
import { arrowForwardOutline } from 'ionicons/icons';
import parseFileMixin from '@/mixins/parseFileMixin';

export default defineComponent({
  name: "Inventory",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonButton,
    IonMenuButton,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonListHeader,
    IonList
  },
  computed: {
    ...mapGetters({
      dateTimeFormat : 'user/getDateTimeFormat',
    })
  },
  data() {
    return {
      file: "",
      content: [],
      fieldMapping: {
        productSku: "",
        quantity: "",
        facility: "",
        locationSeqId: "",
      },
      productsList: [],
    }
  },
  mixins:[ parseFileMixin ],
  methods: {
    async parse(event) {
      this.file = event.target.files[0];
      this.content = await this.parseCsv(this.file);
    },
    mapFields() {
      const areAllFieldsSelected = Object.values(this.fieldMapping).every(field => field !== "");
      if (this.content.length <= 0) {
        showToast(translate("Please upload a valid reset inventory csv to continue"));
        return;
      }
      
      if (!areAllFieldsSelected) {
        showToast(translate("Select all the fields to continue"));
        return;
      } 

      this.productsList = this.content.map(item => {
        return {
          shopifyProductSKU: item[this.fieldMapping.productSku],
          quantity: item[this.fieldMapping.quantity],
          facilityId: '',
          externalFacilityId: item[this.fieldMapping.facility],
          locationSeqId: item[this.fieldMapping.locationSeqId]
        }
      })
      this.store.dispatch('stock/updatedStockList', this.productsList);
      this.router.push({
        name:'InventoryDetail'
      })
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return {
      arrowForwardOutline,
      router,
      store
    }
  } 
})
</script>

<style scoped>
main {
  max-width: 732px;
  margin: var(--spacer-sm) auto 0; 
}

ion-button{
  margin: var(--spacer-base) var(--spacer-sm);
}

label {
  cursor: pointer;
}
</style>
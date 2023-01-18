<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Purchase orders") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <ion-item>
          <ion-label>{{ $t("Purchase order") }}</ion-label>
          <ion-label class="ion-text-right ion-padding-end">{{ file.name }}</ion-label>
          <input @change="getFile" ref="file" class="ion-hide" type="file" id="inputFile" placeholder="Select CSV" />
          <label for="inputFile">{{ $t("Upload") }}</label>
        </ion-item> 
        <ion-list>
          <ion-list-header>{{ $t("Saved mappings") }}</ion-list-header>
          <div>
            <ion-chip :disabled="!file" outline="true" @click="addFieldMapping()">
              <ion-icon :icon="addOutline" />
              <ion-label>{{ $t("New mapping") }}</ion-label>
            </ion-chip>
            <ion-chip :disabled="!file" outline="true" v-for="mapping in fieldMappings" :value="mapping" :key="mapping?.mappingPrefId" @click="mapFields(mapping)">
              {{ mapping?.mappingPrefName }}
            </ion-chip>
          </div>
        </ion-list>

        <ion-list>
          <ion-list-header>{{ $t("Select the column index for the following information in the uploaded CSV.") }}</ion-list-header>

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

        <ion-button color="medium" @click="review" expand="block">
          {{ $t("Review") }}
          <ion-icon slot="end" :icon="arrowForwardOutline" />
        </ion-button>
      </main>
    </ion-content>
  </ion-page>
</template>
<script>
import { IonChip, IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonList, IonListHeader, IonMenuButton, IonButton, IonSelect, IonSelectOption, IonIcon, modalController } from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from 'vue-router';
import { useStore, mapGetters } from "vuex";
import { showToast, parseCsv } from '@/utils';
import { translate } from "@/i18n";
import { arrowForwardOutline, addOutline } from 'ionicons/icons';
import { DateTime } from 'luxon';
import FieldMappingModal from '@/views/FieldMappingModal.vue';

export default defineComponent({
    name: "purchase orders",
    components: {
      IonChip,
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
        fieldMappings: 'user/getFieldMappings'
      })
    },
    data() {
      return {
        file: "",
        content: [],
        fieldMapping: {
          orderId: "",
          productSku: "",
          orderDate: "",
          quantity: "",
          facility: "",
        },
        mappingName: "",
        orderItemsList: [],
      }
    },
    methods: {
      //Todo: Generating unique identifiers as we are currently storing in local storage. Need to remove it as we will be storing data on server.
      generateUniqueMappingPrefId() {
        const id = Math.floor(Math.random() * 1000);
        return !this.fieldMappings[id] ? id : this.generateUniqueMappingPrefId();
      },
      saveMapping() {
        if(!this.mappingName) {
          showToast(translate("Enter mapping name"));
          return
        }
        if (!this.file) {
          showToast(translate("Upload a file"));
          return
        }
        if (!this.areAllFieldsSelected()) {
          showToast(translate("Map all fields"));
          return
        }
        const mappingPrefId = this.fieldMappings[this.mappingName] ? this.fieldMappings[this.mappingName] : this.generateUniqueMappingPrefId();
        this.store.dispatch('user/updateFieldMappings', { mappingPrefId, mappingPrefName: this.mappingName, mappingPrefValue: JSON.parse(JSON.stringify(this.fieldMapping)) })
        showToast(translate("Mapping saved successfully"));
        this.mappingName = "";
      },
      getFile(event) {
        this.file = event.target.files[0];
        if(this.file){
          showToast(translate("File uploaded successfully"));
          this.parseFile();
          this.store.dispatch('order/updateFileName', this.file.name);
        }
        else {
          showToast(translate("Something went wrong. Please try again"));
        }
      },
      async parseFile(){
        await parseCsv(this.file).then(res => {
          this.content = res;
        })
      },
      review() {
        if (this.content.length <= 0) {
          showToast(translate("Please upload a valid purchase order csv to continue"));
        } else if (this.areAllFieldsSelected()) {
          this.orderItemsList = this.content.map(item => {
            return {
              orderId: item[this.fieldMapping.orderId],
              shopifyProductSKU: item[this.fieldMapping.productSku],
              arrivalDate: item[this.fieldMapping.orderDate], 
              quantityOrdered: item[this.fieldMapping.quantity],
              facilityId: '',
              externalFacilityId: item[this.fieldMapping.facility]
            }
          })
          this.store.dispatch('order/updatedOrderList', this.orderItemsList);
          this.router.push({
            name:'PurchaseOrderDetail'
          })
        } else {
          showToast(translate("Select all the fields to continue"));
        } 
      },
      mapFields(mapping) {
        if(mapping && mapping.mappingPrefValue) {
          const fieldMapping = mapping
          const CsvFields = Object.keys(this.content[0]);

          const missingFields = Object.values(fieldMapping.mappingPrefValue).filter(field => {
            if(!Object.keys(this.content[0]).includes(field)) return field;
          });
          if(missingFields.length) showToast(translate("Some of the mapping fields are missing in the CSV: ", { missingFields: missingFields.join(", ") }))

          Object.keys(fieldMapping.mappingPrefValue).map((field) => {
            if(!CsvFields.includes(fieldMapping.mappingPrefValue[field])){
              fieldMapping.mappingPrefValue[field] = "";
            }
          })
          this.fieldMapping = mapping.mappingPrefValue;
        }
      },
      areAllFieldsSelected() {
        return Object.values(this.fieldMapping).every(field => field !== "");
      },
      async addFieldMapping() {
        const fieldMappingModal = await modalController.create({
          component: FieldMappingModal,
          componentProps: { content: this.content, fieldMapping: this.fieldMapping }
        });
        return fieldMappingModal.present();
      }
    },
    setup() {
    const router = useRouter();
    const store = useStore();
    return {
      arrowForwardOutline,
      addOutline,
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
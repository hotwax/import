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
          <input @change="parseFile" ref="file" class="ion-hide" type="file" id="inputFile"/>
          <label for="inputFile">{{ $t("Upload") }}</label>
        </ion-item>

        <ion-list>
          <ion-list-header>{{ $t("Saved mappings") }}</ion-list-header>
          <div>
            <ion-chip :disabled="!file" outline="true" @click="addFieldMapping()">
              <ion-icon :icon="addOutline" />
              <ion-label>{{ $t("New mapping") }}</ion-label>
            </ion-chip>
            <ion-chip :disabled="!file" v-for="(mapping, index) in fieldMappings ?? []" :key="index" @click="mapFields(mapping)" outline="true">
              {{ mapping.name }}
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
import { showToast, parseCsv } from '@/utils';
import { translate } from "@/i18n";
import { DateTime } from 'luxon';
import parseFileMixin from '@/mixins/parseFileMixin';
import { mapGetters, useStore } from "vuex";
import { addOutline, arrowForwardOutline } from 'ionicons/icons';
import CreateMappingModal from "@/components/CreateMappingModal.vue";

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
        dateTimeFormat : 'user/getPreferredDateTimeFormat',
        fieldMappings: 'user/getFieldMappings'
      })
    },
    mixins:[ parseFileMixin ],
    data() {
      return {
        file: {},
        content: [],
        fieldMapping: {
          orderId: "",
          productSku: "",
          orderDate: "",
          quantity: "",
          facility: "",
        },
        PurchaseOrderItems: [],
      }
    },
    methods: {
      //Todo: Generating unique identifiers as we are currently storing in local storage. Need to remove it as we will be storing data on server.
      generateUniqueMappingPrefId() {
        const id = Math.floor(Math.random() * 1000);
        return !this.fieldMappings[id] ? id : this.generateUniqueMappingPrefId();
      },
      async parseFile(event) {
        const file = event.target.files[0];
        if(file){
          this.file = file;
          await parseCsv(this.file).then(res => {
            this.content = res;
          })
          this.store.dispatch('order/updateFileName', this.file.name);
          showToast(translate("File uploaded successfully"));
        } else {
          showToast(translate("No new file upload. Please try again"));
        }
      },
      review() {
        if (this.content.length <= 0) {
          showToast(translate("Please upload a valid purchase order csv to continue"));
          return;
        } 

        if (!this.areAllFieldsSelected()) {
          showToast(translate("Select all the fields to continue"));
          return;
        }

        this.PurchaseOrderItems = this.content.map(item => {
          return {
            orderId: item[this.fieldMapping.orderId],
            shopifyProductSKU: item[this.fieldMapping.productSku],
            arrivalDate: DateTime.fromFormat(item[this.fieldMapping.orderDate], this.dateTimeFormat).toFormat(this.dateTimeFormat), //This is to verify whether the date format is correct.
            quantityOrdered: item[this.fieldMapping.quantity],
            facilityId: '',
            externalFacilityId: item[this.fieldMapping.facility]
          }
        })
        this.store.dispatch('order/fetchOrderDetails', this.PurchaseOrderItems);
        this.router.push({
          name:'PurchaseOrderReview'
        })
      },
      mapFields(mapping) {
        const fieldMapping = JSON.parse(JSON.stringify(mapping));

        // TODO: Store an object in this.content variable, so everytime when accessing it, we don't need to use 0th index
        const csvFields = Object.keys(this.content[0]);

        const missingFields = Object.values(fieldMapping.value).filter(field => {
          if(!csvFields.includes(field)) return field;
        });

        if(missingFields.length) showToast(translate("Some of the mapping fields are missing in the CSV: ", { missingFields: missingFields.join(", ") }))

        Object.keys(fieldMapping.value).map((key) => {
          if(!csvFields.includes(fieldMapping.value[key])){
            fieldMapping.value[key] = "";
          }
        })
        this.fieldMapping = fieldMapping.value;
      },
      areAllFieldsSelected() {
        return Object.values(this.fieldMapping).every(field => field !== "");
      },
      async addFieldMapping() {
        if(this.content.length <= 0) {
          showToast(translate("Please upload a valid purchase order csv to continue"));
          return;
        }
        const createMappingModal = await modalController.create({
          component: CreateMappingModal,
          componentProps: { content: this.content, seletedFieldMapping: this.fieldMapping }
        });
        return createMappingModal.present();
      }
    },
    setup() {
    const router = useRouter();
    const store = useStore();
    return {
      addOutline,
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
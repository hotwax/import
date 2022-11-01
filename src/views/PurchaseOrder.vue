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
          <ion-label>{{ file.name ? $t("Purchase order ") +  file.name : $t('Purchase order') }}</ion-label>
          <input @change="getFile" ref="file" class="ion-hide" type="file" id="inputFile"/>
          <label for="inputFile">{{ $t("Upload") }}</label>
        </ion-item> 

        <ion-item lines="none">
          <ion-label>{{ $t("Select mapping") }}</ion-label>
          <ion-select interface="popover" @ionChange="mapFields">
            <ion-select-option v-for="mapping in fieldMappings" :value="mapping" :key="mapping">{{ mapping.name }}</ion-select-option>
          </ion-select>
        </ion-item>     

        <ion-list>
          <ion-list-header>{{ $t("Select the column index for the following information in the uploaded CSV.") }}</ion-list-header>

          <ion-item>
            <ion-label>{{ $t("Order ID") }}</ion-label>
            <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fields.orderId">
              <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Shopify product SKU") }}</ion-label>
            <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fields.productSku">
              <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Arrival date") }}</ion-label>
            <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fields.date">
              <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Ordered quantity") }}</ion-label>
            <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fields.quantity">
              <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Facility ID") }}</ion-label>
            <ion-select interface="popover" v-if="content.length" :placeholder = "$t('Select')" v-model="fields.facility">
              <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-list>  

        <ion-button color="medium" @click="review" expand="block">
          {{ $t("Review") }}
          <ion-icon slot="end" :icon="arrowForwardOutline" />
        </ion-button>

        <ion-item>
          <ion-label>{{ $t("Mapping name") }}</ion-label>
          <ion-input v-model="mappingName" />
        </ion-item>
        <ion-button @click="savaMapping">{{ $t("Save mapping") }}</ion-button>

      </main>
    </ion-content>
  </ion-page>
</template>
<script>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonLabel, IonList, IonListHeader, IonNote, IonMenuButton, IonButton, IonSelect, IonSelectOption, IonIcon } from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from 'vue-router';
import { useStore, mapGetters } from "vuex";
import { showToast, parseCsv } from '@/utils';
import { translate } from "@/i18n";
import { arrowForwardOutline } from 'ionicons/icons';

export default defineComponent({
    name: "purchase orders",
    components: {
      IonPage,
      IonHeader,
      IonToolbar,
      IonTitle,
      IonContent,
      IonItem,
      IonInput,
      IonLabel,
      IonButton,
      IonMenuButton,
      IonSelect,
      IonSelectOption,
      IonIcon,
      IonListHeader,
      IonList
    },
    data() {
      return {
        file: "",
        content: [],
        fields: {
          orderId: "",
          productSku: "",
          date: "",
          quantity: "",
          facility: "",
        },
        mappingName: "",
        orderItemsList: [],
      }
    },
    computed: {
      ...mapGetters({
        fieldMappings: 'user/getFieldMappings'
      })
    },
    methods: {
      savaMapping() {
        this.store.dispatch('user/updateFieldMappings', { name: this.mappingName, fieldMapping: this.fields })
      },
      getFile(event) {
        this.file = event.target.files[0];
        if(this.file){
          showToast(translate("File uploaded successfully"));
          this.parseFile();
          this.store.dispatch('order/updateFileName', this.file.name);
        }
        else {
          showToast(translate("Something went wrong, Please try again"));
        }
      },
      async parseFile(){
        await parseCsv(this.file).then(res => {
          this.content = res;
        })
      },
      review() {
        if(!this.orderItemsList.length) this.mapFields();
        this.store.dispatch('order/updatedOrderList', this.orderItemsList);
        this.router.push({
          name:'PurchaseOrderDetail'
        })
      },
      mapFields(event) {
        if(event && event.detail.value){
          const mapping = JSON.parse(JSON.stringify(event.detail.value));
          this.fields = mapping.fieldMapping;
          this.mappingName = mapping.name;
        }
        this.orderItemsList = this.content.map(item => {
          return {
            orderId: item[this.fields.orderId],
            shopifyProductSKU: item[this.fields.productSku],
            shopifyProductUPC: item[this.fields.productUpc],
            arrivalDate: item[this.fields.date],
            quantityOrdered: item[this.fields.quantity],
            facilityId: '',
            externalFacilityId: item[this.fields.facility]
          }
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
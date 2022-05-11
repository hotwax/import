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
          <input @change="getFile" ref="file" class="ion-hide" type="file" id="inputFile"/>
          <label for="inputFile">{{ $t("Upload") }}</label>
        </ion-item>       

        <ion-list>
          <ion-list-header>{{ $t("Select the column index for the following information in the uploaded CSV.") }}</ion-list-header>
          <ion-item>
            <ion-label>{{ $t("Order ID") }}</ion-label>
            <ion-select v-if="content.length" :placeholder = "$t('Select')" v-model="orderIdField">
                <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Shopify product SKU") }}</ion-label>
            <ion-select v-if="content.length" :placeholder = "$t('Select')" v-model="productSkuField">
              <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Arrival date") }}</ion-label>
            <ion-select v-if="content.length" :placeholder = "$t('Select')" v-model="dateField">
              <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Ordered quantity") }}</ion-label>
            <ion-select v-if="content.length" :placeholder = "$t('Select')" v-model="quantityField">
              <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Facility ID") }}</ion-label>
            <ion-select v-if="content.length" :placeholder = "$t('Select')" v-model="facilityField">
              <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
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
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonMenuButton, IonButton, IonSelect, IonSelectOption, IonIcon } from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from 'vue-router';
import { useStore } from "vuex";
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
        orderIdField: "",
        productSkuField: "",
        dateField: "",
        quantityField: "",
        facilityField: "",
        orderItemsList: [],
      }
    },
    methods: {
      getFile(event) {
        this.file = event.target.files[0];
        if(this.file){
          showToast(translate("File uploaded successfully"));
          this.parseFile();
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
      mapFields() {
        this.orderItemsList = this.content.map(item => {
          const orderItem = {
          orderId: [],
          shopifyProductSKU: [],
          shopifyProductUPC: [],
          arrivalDate: [],
          quantityOrdered: [],
          facilityId: []
        }
          orderItem.orderId = item[this.orderIdField];
          orderItem.shopifyProductSKU = item[this.productSkuField];
          orderItem.arrivalDate = item[this.dateField];
          orderItem.quantityOrdered = item[this.quantityField];
          orderItem.facilityId = item[this.facilityField]
          return orderItem
        })
        this.store.dispatch('order/updatedOrderList', this.orderItemsList);
        this.router.push({
          name:'PurchaseOrderDetail'
        })
      },
    },
    beforeUnmount(){
      this.file = '';
      this.content = [];
      this.orderIdField = '';
      this.productSkuField = '';
      this.dateField = '';
      this.quantityField = '';
      this.facilityField = '';
      this.orderItemsList = [];
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
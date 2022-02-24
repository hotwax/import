<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/home" />
        <ion-title>{{ $t("Purchase orders") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="header">
        <div class="fileInput">
          <ion-item>
            <ion-label>{{ $t("Purchase order") }}</ion-label>
            <input @change="getFile" ref="file" class="ion-hide" type="file" id="inputFile"/>
            <label for="inputFile">{{ $t("Upload") }}</label>
          </ion-item>
        </div>
        <div class="info">
          <ion-note>{{ $t("Select the column index for the following information in the uploaded CSV.") }}</ion-note>
          <ion-item>
              <ion-label>{{ $t("Order ID") }}</ion-label>
              <ion-select v-if="content.length" placeholder="Select" v-model="orderIdField">
                  <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
              </ion-select>
          </ion-item>
          <ion-item>
              <ion-label>{{ $t("Shopify product SKU") }}</ion-label>
              <ion-select v-if="content.length" placeholder="Select" v-model="productSkuField">
                  <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
              </ion-select>
          </ion-item>
          <ion-item>
              <ion-label>{{ $t("Shopify product UPC") }}</ion-label>
              <ion-select v-if="content.length" placeholder="Select" v-model="productUpcField">
                  <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
              </ion-select>
          </ion-item>
          <ion-item>
              <ion-label>{{ $t("Arrival date") }}</ion-label>
              <ion-select v-if="content.length" placeholder="Select" v-model="dateField">
                  <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
              </ion-select>
          </ion-item>
          <ion-item>
              <ion-label>{{ $t("Ordered quantity") }}</ion-label>
              <ion-select v-if="content.length" placeholder="Select" v-model="quantityField">
                  <ion-select-option v-bind:key="index" v-for="(prop, index) in Object.keys(content[0])">{{ prop }}</ion-select-option>
              </ion-select>
          </ion-item>
          <ion-button color="dark" fill="solid" @click="mapFields" expand="block">{{ $t("REVIEW") }}</ion-button>
        </div>
      </div>     
    </ion-content>    
  </ion-page>
</template>
<script>
import { IonPage, IonHeader, IonToolbar, IonBackButton, IonTitle, IonContent, IonItem, IonLabel, IonNote, IonButton, IonSelect } from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from 'vue-router';
import { parseCsv } from '@/utils';
import { useStore } from "vuex";
export default defineComponent({
    name: " purchase orders",
    components: {
      IonPage,
      IonHeader,
      IonToolbar,
      IonBackButton,
      IonTitle,
      IonContent,
      IonItem,
      IonLabel,
      IonButton,
      IonSelect,
      IonNote
    },
    data() {
      return {
        file: "",
        content: [],
        orderIdField: "",
        productSkuField: "",
        productUpcField: "",
        dateField: "",
        quantityField: "",
        csvParsed: [],
        csvObject: {
          orderId: [],
          shopifyproductSKU: [],
          shopifyproductUPC: [],
          arrivalDate: [],
          quantityOrdered: []
        }
      }
    },
    methods: {
      getFile(event) {
        this.file = event.target.files[0];
        this.parseFile();
      },
      async parseFile(){
        await parseCsv(this.file).then(res => {
          this.content = res;
        })
      },
      mapFields() {
        this.csvParsed = [];
        this.content.map(item => {
          this.csvObject.orderId = item[this.orderIdField];
          this.csvObject.shopifyproductSKU = item[this.productSkuField];
          this.csvObject.shopifyproductUPC = item[this.productUpcField];
          this.csvObject.arrivalDate = item[this.dateField];
          this.csvObject.quantityOrdered = item[this.quantityField];
          this.csvParsed.push(this.csvObject);            
        })
        this.store.dispatch("order/uploadCsv", this.csvParsed);
        this.fetchProducts()
        this.router.push({
          name:'Purchase Order Detail'
        })
      },
      async fetchProducts(vSize, vIndex) {
        const productIds = this.csvParsed.map(item => {
          return item.shopifyproductSKU
        })
        const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
        const viewIndex = vIndex ? vIndex : 0;
        const payload = {
          viewSize,
          viewIndex,
          productIds
        }
        await this.store.dispatch("product/fetchProducts", payload);
      },
    }, 
    setup(){
    const router = useRouter();
    const store = useStore();
    return {
      router,
      store
    }
  } 
})
</script>   
<style scoped>

.header {
  max-width: 60%;
  grid-gap: 16px;
  padding: 16px;
  margin-bottom: 16px;
  margin: auto; 
}

.info{
  padding-top: 40px;
}
</style>
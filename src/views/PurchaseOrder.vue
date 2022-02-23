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
              <ion-select placeholder="Select"></ion-select>
          </ion-item>
          <ion-item>
              <ion-label>{{ $t("Shopify product SKU") }}</ion-label>
              <ion-select placeholder="Select"></ion-select>
          </ion-item>
          <ion-item>
              <ion-label>{{ $t("Shopify product UPC") }}</ion-label>
              <ion-select placeholder="Select"></ion-select>
          </ion-item>
          <ion-item>
              <ion-label>{{ $t("Arrival date") }}</ion-label>
              <ion-select placeholder="Select"></ion-select>
          </ion-item>
          <ion-item>
              <ion-label>{{ $t("Ordered quantity") }}</ion-label>
              <ion-select placeholder="Select"></ion-select>
          </ion-item>
          <ion-button color="dark" fill="solid" disabled="true" expand="block">{{ $t("REVIEW") }}</ion-button>
        </div>
      </div>     
    </ion-content>    
  </ion-page>
</template>
<script>
import { IonPage, IonHeader, IonToolbar, IonBackButton, IonTitle, IonContent, IonItem, IonLabel, IonNote, IonButton, IonSelect } from "@ionic/vue";
import { defineComponent, ref } from "vue";
import { parseCsv } from '@/utils'
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
        content:[]
      }
    },
    methods: {
      getFile(event) {
        const file = ref(null);
        this.file = event.target.files[0];
        this.parseFile();
      },
      async parseFile(){
        await parseCsv(this.file).then(res => {
          this.content = res;
          console.log(res);
        })
      },
    },
    
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
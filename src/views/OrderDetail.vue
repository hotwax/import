<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/home" />
        <ion-title>{{ $t("PO External Order ID") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="header">
        <div class="search">
          <ion-searchbar> </ion-searchbar>
        </div> 

        <div class="filters">
          <ion-item>
            <ion-label>{{ $t("Buffer days") }}</ion-label>
            <ion-input type="text" placeholder="all items" /> 
          </ion-item>
          <ion-item>
            <ion-label>{{ $t("Order buffer") }}</ion-label>
            <ion-input type="text" value="50" /> 
          </ion-item>
          <ion-item>
            <ion-label>{{ $t("Catalog") }}</ion-label>
            <ion-select value="Backorder">
              <ion-select-option>Backorder</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-button expand="block" fill="outline">Apply</ion-button>
        </div> 
      </div>  
      <div class="list-item" v-for="(orderItem, index) in parsedCsv" :key="index" >
        <ion-item lines="none">
          <ion-thumbnail slot="start">
            <Image :src="getProduct(orderItem.shopifyproductSKU).mainImageUrl" />
          </ion-thumbnail>
          <ion-label>
            {{ getProduct(orderItem.shopifyproductSKU).internalName }}
          </ion-label>
        </ion-item>

        <ion-chip outline>
          <ion-label>{{ $t("Backorder") }}</ion-label>
        </ion-chip>

        <ion-chip outline>
          <ion-label>{{ orderItem.quantityOrdered }} {{ $t("Ordered") }}</ion-label>
        </ion-chip>

        <ion-chip outline>
          <ion-icon :icon="sendOutline" />
          <ion-label>{{ orderItem.arrivalDate }}</ion-label>
        </ion-chip>

        <ion-checkbox />

        <ion-button fill="clear" color="medium">
          <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
        </ion-button>
      </div>   
    </ion-content>    
  </ion-page>
</template>   
<script lang="ts">
import Image from '@/components/Image.vue';

import { defineComponent } from 'vue';
import { mapGetters, useStore } from "vuex";
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonBackButton, IonTitle, IonContent, IonSearchbar, IonItem, IonThumbnail, IonLabel, IonInput, IonChip, IonIcon, IonButton, IonCheckbox, IonSelect, IonSelectOption } from '@ionic/vue'
import { ellipsisVerticalOutline, sendOutline } from 'ionicons/icons'
export default defineComponent({
    components: {
      Image,
      IonPage,
      IonHeader,
      IonToolbar,
      IonBackButton,
      IonTitle,
      IonContent,
      IonSearchbar,
      IonItem,
      IonThumbnail,
      IonLabel,
      IonInput,
      IonChip,
      IonIcon,
      IonButton,
      IonCheckbox,
      IonSelect,
      IonSelectOption
    },
    computed: {
      ...mapGetters({
        parsedCsv: 'order/getCsv',
        getProduct: 'product/getProduct'
      })
    },
    setup() {
      const router = useRouter();
      const store = useStore();
      return {
        ellipsisVerticalOutline,
        sendOutline,
        router,
        store
      }
    }
});

</script>
<style scoped>
.header {
  display: grid;
  grid: "search filters"
        /1fr 1fr;
  grid-gap: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.search {
  grid-area: search;
}

.filters {
  grid-area: filters;
}
.list-item{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

</style>
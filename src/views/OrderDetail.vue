<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/home" />
        <ion-title>{{ $t("PO External Order ID") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="checkAllProducts">
            <ion-icon :icon="checkboxOutline" />
          </ion-button>
          <ion-button @click="revert">
            <ion-icon :icon="arrowUndoOutline" />
          </ion-button>
        </ion-buttons>
        
        
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
            <ion-input v-model="numberOfDays" type="text" placeholder="all items" /> 
          </ion-item>
          <ion-item>
            <ion-label>{{ $t("Order buffer") }}</ion-label>
            <ion-input v-model="numberOfpieces" type="number" />
          </ion-item>
          <ion-item>
            <ion-label>{{ $t("Catalog") }}</ion-label>
            <ion-select v-model="catalog">
              <ion-select-option>Backorder</ion-select-option>
              <ion-select-option>Preorder</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-button expand="block" fill="outline" @click="apply">Apply</ion-button>
        </div> 
      </div>  

      <div v-for="id in getGroupList" :key="id">
        <div  >
          <ion-item class="list-header" >
          <ion-label>{{}}</ion-label>
           <ion-chip >
          <ion-label></ion-label>
        </ion-chip>

        <ion-chip >
          <ion-label></ion-label>
        </ion-chip>

        <ion-chip >
          <ion-icon />
          <ion-label></ion-label>
        </ion-chip>
          <ion-checkbox slot="end" />
          <ion-button slot="end" fill="clear" color="medium">
            <ion-icon  :icon="ellipsisVerticalOutline" />
          </ion-button>
     
        </ion-item>
        </div>
        <div v-for="item in parsedCsv" :key="item"  >
          <div v-if="item.groupId == id" class="list-item">
        <ion-item  lines="none">
      <!-- <p>{{item}}</p> -->
          <ion-thumbnail>
            <Image :src="item.imageUrl" />
          </ion-thumbnail>
          <ion-label>
            {{ item.internalName }}
          </ion-label>
        </ion-item>

        <ion-chip outline>
          <ion-label>{{ $t("Backorder") }}</ion-label>
        </ion-chip>

        <ion-chip outline>
          <ion-label>{{ item.quantityOrdered }} {{ $t("Ordered") }}</ion-label>
        </ion-chip>

        <ion-chip outline>
          <ion-icon :icon="sendOutline" />
          <ion-label>{{ item.arrivalDate }}</ion-label>
        </ion-chip>

        <ion-checkbox v-if="listOfCheckedProducts.includes(item.shopifyproductSKU)" checked="true" @click="onChange(orderItem.shopifyproductSKU)"/>
        <ion-checkbox v-else @click="onChange(item.shopifyproductSKU)"/>

        <ion-button fill="clear" color="medium">
          <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
        </ion-button>
        </div>
        </div>
      </div>   
    </ion-content>   
  </ion-page>
</template>   
<script lang="ts">
import Image from '@/components/Image.vue';

import { defineComponent } from 'vue';
import { mapGetters, useStore } from "vuex";
import { useRouter } from 'vue-router';
import { DateTime } from 'luxon';
import { IonPage, IonHeader, IonToolbar, IonBackButton, IonTitle, IonContent, IonSearchbar, IonItem, IonThumbnail, IonLabel, IonInput, IonChip, IonIcon, IonButton, IonCheckbox, IonSelect, IonSelectOption } from '@ionic/vue'
import { ellipsisVerticalOutline, sendOutline, checkboxOutline, arrowUndoOutline } from 'ionicons/icons'
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
        parsedCsv: 'order/getOrdeItems',
        getProduct: 'product/getProduct',
      }),
       getGroupList: function () {
        const list = (this as any).parsedCsv.map((item: any) => {
          return item.groupId;
        })
        console.log(new Set([...list]), this.parsedCsv[0].shopifyproductSKU);
        return new Set([...list])
      }
    },
    data() {
      return {
        numberOfDays: 0,
        numberOfpieces: 0,
        catalog: "",
        listOfCheckedProducts: [] as any,
        originalCsv: {}
      }
    },
    mounted(){
      console.log(this.getGroupList, this.parsedCsv);
    },
    methods: {
      onChange(productSku: string) {
        if(this.listOfCheckedProducts.includes(productSku)){
          this.listOfCheckedProducts.splice(this.listOfCheckedProducts.indexOf(productSku, 1));
        }
        else{
          this.listOfCheckedProducts.push(productSku);
        }
      },
      apply() {
        this.parsedCsv.map((item: any) => {
          if (this.listOfCheckedProducts.includes(item.shopifyproductSKU)) {
            item.quantityOrdered -= this.numberOfpieces;
            item.arrivalDate = DateTime.fromFormat(item.arrivalDate, "D").plus({ days: this.numberOfDays }).toFormat('MM/dd/yyyy');
          }
        })
        console.log(this.getGroupList);
        this.store.dispatch("order/modifyCsv", this.parsedCsv);
      },
      checkAllProducts() {
        this.parsedCsv.forEach((item: any) => {
          this.onChange(item.shopifyproductSKU);
        })
      },
      revert(){
        this.parsedCsv = this.originalCsv;
      }
    },
    setup() {
      const router = useRouter();
      const store = useStore();
      return {
        checkboxOutline,
        ellipsisVerticalOutline,
        sendOutline,
        arrowUndoOutline,
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
/* TODO: Use universal list item class */
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.list-header {
  display: flex;
  align-items: center;
  --background: #F4F5F8;
}

</style>
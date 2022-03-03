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
          <ion-button>
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
            <ion-input v-model="numberOfDays" type="text" :placeholder = "$t('all items')" /> 
          </ion-item>
          <ion-item>
            <ion-label>{{ $t("Order buffer") }}</ion-label>
            <ion-input v-model="numberOfPieces" type="number" />
          </ion-item>
          <ion-item>
            <ion-label>{{ $t("Catalog") }}</ion-label>
            <ion-select v-model="catalog">
              <ion-select-option>{{ $t("Backorder") }}</ion-select-option>
              <ion-select-option>{{ $t("Preorder") }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-button expand="block" fill="outline" @click="apply">{{ $t("Apply") }}</ion-button>
        </div> 
      </div>  

      <div v-for="id in getGroupList(ordersList.items)" :key="id" >
        <div v-for="item in getGroupItems(id, ordersList.items)" :key="item">
          <div class="list-header" >
            <ion-label>{{ item.parentProductName }}</ion-label>
            <div />
            <div />
            <div />
            <ion-checkbox @click="checkGroupedProducts(id)" />
            <ion-button fill="clear" color="medium">
              <ion-icon  :icon="ellipsisVerticalOutline" />
            </ion-button>
          </div>
          <div class="list-item">
            <ion-item  lines="none">
              <ion-thumbnail>
                <Image :src="item.imageUrl" />
              </ion-thumbnail>
              <ion-label>
                {{ item.internalName }}
              </ion-label>
            </ion-item>
            <ion-chip outline>
              <ion-label>{{ item.isNewProduct? $t("Preorder") : $t("Backorder") }}</ion-label>
            </ion-chip>
            <ion-chip outline>
              <ion-label>{{ item.quantityOrdered }} {{ $t("Ordered") }}</ion-label>
            </ion-chip>
            <ion-chip outline>
              <ion-icon :icon="sendOutline" />
              <ion-label>{{ item.arrivalDate }}</ion-label>
            </ion-chip>
              <ion-checkbox  v-if="listOfCheckedProducts.includes(item.shopifyProductSKU)" checked="true" @click="checkProducts(item.shopifyProductSKU)"/>
            <ion-checkbox v-else @click="checkProducts(item.shopifyProductSKU)"/>
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
        ordersList: 'order/getOrdersList',
        getProduct: 'product/getProduct',
      }),
    },
    data() {
      return {
        numberOfDays: 0,
        numberOfPieces: 0,
        catalog: "",
        listOfCheckedProducts: [] as any,
      }
    },
    methods: {
      checkProducts(productSku: string) {
        if (this.listOfCheckedProducts.includes(productSku)) {
          this.listOfCheckedProducts.splice(this.listOfCheckedProducts.indexOf(productSku, 1));
        }
        else {
          this.listOfCheckedProducts.push(productSku);
        }
      },
      apply() {
        this.ordersList.items.map((item: any) => {
          if (this.listOfCheckedProducts.includes(item.shopifyProductSKU)) {
            item.quantityOrdered -= this.numberOfPieces;
            item.arrivalDate = DateTime.fromFormat(item.arrivalDate, "D").plus({ days: this.numberOfDays }).toFormat('MM/dd/yyyy');
            if (this.catalog == "Preorder") item.isNewProduct = true
            else item.isNewProduct = false
          }
        })
        this.store.commit('order/order/ITEMS_UPDATED', this.ordersList.items);
      },
      getGroupList (items: any) {
        return Array.from(new Set(items.map((ele: any) => ele.parentProductId)))
      },
      getGroupItems(parentProductId: any, items: any) {
        return items.filter((item: any) => item.parentProductId == parentProductId)
      },
      checkAllProducts() {
        this.ordersList.items.forEach((item: any) => {
          this.checkProducts(item.shopifyProductSKU);
        })
      },
      checkGroupedProducts(parentProductId: any){
        const groupedProducts = this.ordersList.items.filter((item: any) => {
           if(item.parentProductId == parentProductId){
             this.checkProducts(item.shopifyProductSKU);
           }
        })
      },
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
  place-items: center;
  justify-content: space-between;
  background-color: #F4F5F8;
  padding-left: 10px;
}

</style>
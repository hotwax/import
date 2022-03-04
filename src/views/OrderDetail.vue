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
            <ion-input v-model="numberOfDays" type="text" placeholder="all items" /> 
          </ion-item>
          <ion-item>
            <ion-label>{{ $t("Order buffer") }}</ion-label>
            <ion-input v-model="numberOfpieces" type="number" />
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

      <div v-for="(id, index) in getGroupList(ordersList.items)" :key="id" >
        <div v-for="item in getGroupItems(id, ordersList.items)" :key="item">
          <div class="list-header" >
            <ion-label>{{ item.parentProductName }}</ion-label>
            <div />
            <div />
            <div />
            <ion-checkbox :checked="isParentProductChecked[index][item.parentProductId]" @ionChange="selectParentProduct(id, $event)" />
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
              <ion-checkbox v-if="listOfCheckedProducts.includes(item.shopifyproductSKU)" checked="true" @click="onChange(item.shopifyproductSKU)"/>
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
    IonSelectOption,
    IonButtons
  },
  computed: {
    ...mapGetters({
      ordersList: 'order/getOrder',
      getProduct: 'product/getProduct',
    }),
    isParentProductChecked(){
    const array= [] as any;
    this.ordersList.items.map((item: any) => {
      const obj = {} as any;
        obj[item.parentProductId] = false;
        array.push(obj);
      })
      return array;
    }
  },
  data() {
    return {
      numberOfDays: 0,
      numberOfPieces: 0,
      catalog: "",
    }
  },
  mounted() {
    this.ordersList.items.forEach((product: any) => {
      product.isSelected = false;
    })
  },
  methods: {
    selectProduct(item: any) {
      item.isSelected = !item.isSelected;
      if (this.ordersList.items.filter((product: any) => item.parentProductId ==  product.parentProductId).every((item: any) => item.isSelected)) {
        this.isParentProductChecked.forEach((id: any) => {
          if (Object.keys(id).includes(item.parentProductId)) {
            id[item.parentProductId] = true;
          }
        })
      }
      else {
        this.isParentProductChecked.forEach((id: any) => {
          if (Object.keys(id).includes(item.parentProductId)) {
            id[item.parentProductId] = false;
          }  
        })
      }
    },
    apply() {
      this.ordersList.items.map((item: any) => {
        if (item.isSelected) {
          item.quantityOrdered -= this.numberOfPieces;
          item.arrivalDate = DateTime.fromFormat(item.arrivalDate, "D").plus({ days: this.numberOfDays }).toFormat('MM/dd/yyyy');
          item.isNewProduct = this.catalog == "Preorder"
        }
      })
      this.store.dispatch('order/updatedOrderListItems', this.ordersList.items);
    },
    getGroupList (items: any) {
      return Array.from(new Set(items.map((ele: any) => ele.parentProductId)))
    },
    computed: {
      ...mapGetters({
        parsedCsv: 'order/getOrdeItems',
        getProduct: 'product/getProduct',
      }),
    },
    selectAllItems() {
      this.ordersList.items.forEach((item: any) => {
        item.isSelected = true;
        this.isParentProductChecked.forEach((id: any) => {
          if (Object.keys(id).includes(item.parentProductId)) {
            id[item.parentProductId] = true;
          }
        })
      })
    },
    selectParentProduct(parentProductId: any, event: any) {
      this.ordersList.items.forEach((item: any) => {
        if (item.parentProductId == parentProductId) {
          if (event.detail.checked) {
            item.isSelected = true;
            this.isParentProductChecked.forEach((ele: any) => {
              if (Object.keys(ele).includes(item.parentProductId)) {
                ele[item.parentProductId] = true;
              }
            })
          }else {
            item.isSelected = false;
            this.isParentProductChecked.forEach((ele: any) => {
              if (Object.keys(ele).includes(item.parentProductId)) {
                ele[item.parentProductId] = false;
              }
            })
          }
        } 
      },
    }
  }    
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
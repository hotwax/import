<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="closeModal">
            <ion-icon :icon="closeOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ $t("Missing SKUs") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div>
        <ion-item id="update-sku" :class="isSkuInvalid ? 'ion-invalid' : ''">
          <ion-input v-model="updatedSku" :clear-input="true" :placeholder="$t('Select SKU')" @ionFocus="selectInputText($event)" />
          <ion-note v-show="hasSkuUpdated && (purchaseOrders.unidentifiedItems.length || stock.unidentifiedItems.length)" slot="helper" color="success">{{ $t("The SKU is successfully changed") }}</ion-note>
          <ion-note slot="error">{{ $t("This SKU is not available, please try again") }}</ion-note>
        </ion-item>
        <ion-button @click="update" :disabled="!(unidentifiedProductSku && updatedSku)">{{ $t("Update") }}</ion-button>
      </div>
      
      <ion-segment v-model="segmentSelected">
        <ion-segment-button value="pending">
          <ion-label>{{ $t("Pending") }}</ion-label>
        </ion-segment-button>
        <ion-segment-button value="completed">
          <ion-label>{{ $t("Completed") }}</ion-label>
        </ion-segment-button>
      </ion-segment>
      <!-- If two different POs contain same missing SKU then in MissingSkuModal, both the products will be selected. -->
      <ion-radio-group @ionChange="updatedSku = $event.detail.value; hasSkuUpdated = false; isSkuInvalid = false;" v-model="unidentifiedProductSku">
        <ion-list v-if="segmentSelected === 'pending'">
          <ion-item v-for="item in getPendingItems()" :key="item.shopifyProductSKU">
            <ion-label>
              {{ item.shopifyProductSKU }}
              <p>{{ item.orderId }}</p>
            </ion-label>
            <ion-radio slot="end" :value="item.shopifyProductSKU" />
          </ion-item>
        </ion-list>

        <ion-list v-if="segmentSelected === 'completed'">
          <ion-item v-for="item in getCompletedItems()" :key="item.shopifyProductSKU">
            <ion-label>
              {{ item.updatedSku }}
              <p>{{ item.orderId }}</p>
            </ion-label>
            <ion-radio slot="end" :value="item.updatedSku" />
          </ion-item>
        </ion-list>
      </ion-radio-group>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="save">
          <ion-icon :icon="saveOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonSegment,
  IonSegmentButton,
  IonHeader,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { closeOutline, saveOutline } from 'ionicons/icons';
import { defineComponent } from "@vue/runtime-core";
import { mapGetters, useStore } from "vuex";
import { ref } from "vue";

export default defineComponent({
  name: "MissingSkuModal",
  components: {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonSegment,
  IonSegmentButton,
  IonHeader,
  IonTitle,
  IonToolbar
  },
  data(){
    return {
      updatedSku: '',
      unidentifiedProductSku: '',
      hasSkuUpdated: false,
      isSkuInvalid: false
    }
  },
  computed: {
    ...mapGetters({
      purchaseOrders: 'order/getPurchaseOrders',
      stock: 'stock/getItemsStock',
    })
  },
  props: ['type'],
  methods: {
    selectInputText(event: any) {
      event.target.getInputElement().then((element: any) => {
        element.select();
      })
    },
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    getPendingItems(){
      if(this.type === 'order') return this.purchaseOrders.unidentifiedItems.filter((item: any) => !item.updatedSku);
      return this.stock.unidentifiedItems.filter((item: any) => !item.updatedSku); 
    },
    getCompletedItems(){
      if(this.type === 'order') return this.purchaseOrders.unidentifiedItems.filter((item: any) => item.updatedSku);
      return this.stock.unidentifiedItems.filter((item: any) => item.updatedSku);
    },
    save(){
      if(this.type === 'order') this.store.dispatch('order/updateUnidentifiedItem', { unidentifiedItems: this.purchaseOrders.unidentifiedItems });
      else this.store.dispatch('stock/updateUnidentifiedItem', { unidentifiedItems: this.stock.unidentifiedItems });
      this.closeModal();
    },
    async update() {
      this.hasSkuUpdated = false;
      this.isSkuInvalid = false;
      const payload = {
        viewSize: 1,
        viewIndex: 0,
        productIds: [this.updatedSku]
      }
      const products = await this.store.dispatch("product/fetchProducts", payload);
      if (!products.length) {
        this.isSkuInvalid = true;
        return;
      }  
      const item = products[0];
      let unidentifiedItem;
      const unidentifiedItems = this.type === 'order' ? this.purchaseOrders.unidentifiedItems : this.stock.unidentifiedItems;
      
      unidentifiedItem = unidentifiedItems.find((unidentifiedItem: any) => unidentifiedItem.shopifyProductSKU === this.unidentifiedProductSku);
      
      unidentifiedItem.updatedSku = this.updatedSku;
      unidentifiedItem.parentProductId = item.parent.id;
      unidentifiedItem.pseudoId = item.pseudoId;
      unidentifiedItem.parentProductName = item.parent.productName;
      unidentifiedItem.imageUrl = item.images.mainImageUrl;
      unidentifiedItem.isSelected = true;
  
      this.hasSkuUpdated = true;
      if (this.type === 'order'){
        unidentifiedItem.isProductNew = 'N';
        this.store.dispatch('order/updatePurchaseOrders', this.purchaseOrders);
      } else {
        this.store.dispatch('stock/updateStockItems', this.stock);
      }
    },
  },
  setup() {
    const store = useStore();
    const segmentSelected = ref('pending');
    return {
      closeOutline,
      saveOutline,
      segmentSelected,
      store
    }
  }
})
</script>
<style scoped>
  div {
    display: flex;
  }

  div ion-item {
    flex-grow: 1;
  }

  ion-button {
    margin: var(--spacer-sm);
  }

  ion-segment {
    margin-top: var(--spacer-sm);
  }
</style>
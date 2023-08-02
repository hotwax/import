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
          <ion-input v-model="updatedSku" :clear-input="true" :placeholder="$t('Select SKU')" @ionFocus="selectInputText($event)" @keyup.enter="update" />
          <ion-note v-show="hasSkuUpdated && (purchaseOrders.unidentifiedItems.length || stockItems.unidentifiedItems.length)" slot="helper" color="success">{{ $t("The SKU is successfully changed") }}</ion-note>
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
            <ion-thumbnail slot="start">
              <Image :src="item.imageUrl" />
            </ion-thumbnail>
            <ion-label>
              <p class="overline">{{ getProductIdentificationValue(productIdentificationPref.primaryId, getProduct(item.pseudoId)) }}</p>
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
  IonThumbnail,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { closeOutline, saveOutline } from 'ionicons/icons';
import { defineComponent } from "@vue/runtime-core";
import { mapGetters, useStore } from "vuex";
import { inject, ref } from "vue";
import Image from '@/components/Image.vue';
import { getProductIdentificationValue } from '@/utils';

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
  IonThumbnail,
  IonToolbar,
  Image
  },
  data(){
    return {
      updatedSku: '',
      unidentifiedProductSku: '',
      hasSkuUpdated: false,
      isSkuInvalid: false,
      unidentifiedItems: [] as any
    }
  },
  computed: {
    ...mapGetters({
      purchaseOrders: 'order/getPurchaseOrders',
      stockItems: 'stock/getStockItems',
      getProduct: 'product/getProduct'
    })
  },
  mounted() {
    this.unidentifiedItems =  this.type ==='order' ? this.purchaseOrders.unidentifiedItems : this.stockItems.unidentifiedItems;  
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
      return this.unidentifiedItems.filter((item: any) => !item.updatedSku);
    },
    getCompletedItems(){
      return this.unidentifiedItems.filter((item: any) => item.updatedSku);
    },
    save() {
      if(this.type === 'order') this.store.dispatch('order/updateUnidentifiedItem', { unidentifiedItems: this.purchaseOrders.unidentifiedItems });
      else this.store.dispatch('stock/updateUnidentifiedItem', { unidentifiedItems: this.stockItems.unidentifiedItems });
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
      const product = products[this.updatedSku];
      if (!product) {
        this.isSkuInvalid = true;
        return;
      }
      
      const unidentifiedItem = this.unidentifiedItems.find((unidentifiedItem: any) => unidentifiedItem.shopifyProductSKU === this.unidentifiedProductSku || unidentifiedItem.updatedSku === this.unidentifiedProductSku );
      
      unidentifiedItem.updatedSku = this.updatedSku;
      unidentifiedItem.parentProductId = product.parent.id;
      unidentifiedItem.pseudoId = product.pseudoId;
      unidentifiedItem.parentProductName = product.parent.productName;
      unidentifiedItem.imageUrl = product.images.mainImageUrl;
      unidentifiedItem.isSelected = true;
  
      this.hasSkuUpdated = true;
      if (this.type === 'order'){
        unidentifiedItem.isNewProduct = 'N';
        this.store.dispatch('order/updatePurchaseOrders', this.purchaseOrders);
      } else {
        this.store.dispatch('stock/updateStockItems', this.stockItems);
      }
    },
  },
  setup() {
    const store = useStore();
    const segmentSelected = ref('pending');

    // Injecting identifier preference from app.view
    const productIdentificationPref: any  = inject("productIdentificationPref");

    return {
      closeOutline,
      saveOutline,
      segmentSelected,
      store,
      productIdentificationPref,
      getProductIdentificationValue
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
<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="closeModal">
            <ion-icon :icon="closeOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ translate("Missing SKUs") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div>
        <ion-item id="update-sku" lines="none">
          <ion-input v-model="updatedSku" :clear-input="true" :placeholder="translate('Select SKU')" @ionFocus="selectInputText($event)" @keyup.enter="update" :class="isSkuInvalid ? 'ion-touched ion-invalid' : ''" :error-text="translate('This SKU is not available, please try again')"/>
        </ion-item>
        <ion-button @click="update" :disabled="!(unidentifiedProductSku && updatedSku)">{{ translate("Update") }}</ion-button>
      </div>
      
      <ion-segment v-model="segmentSelected">
        <ion-segment-button value="pending">
          <ion-label>{{ translate("Pending") }}</ion-label>
        </ion-segment-button>
        <ion-segment-button value="completed">
          <ion-label>{{ translate("Completed") }}</ion-label>
        </ion-segment-button>
      </ion-segment>
      <!-- If two different POs contain same missing SKU then in MissingSkuModal, both the products will be selected. -->
      <ion-radio-group @ionChange="updatedSku = $event.detail.value; hasSkuUpdated = false; isSkuInvalid = false;" v-model="unidentifiedProductSku">
        <ion-list v-if="segmentSelected === 'pending'">
          <ion-item v-for="item in getPendingItems()" :key="item.identification">
            <ion-radio :value="item.identification">
              <ion-label>
                {{ item.identification }}
                <p>{{ item.orderId }}</p>
              </ion-label>
            </ion-radio>
          </ion-item>
        </ion-list>

        <ion-list v-if="segmentSelected === 'completed'">
          <ion-item v-for="item in getCompletedItems()" :key="item.identification">
            <ion-thumbnail slot="start">
              <DxpShopifyImg :src="item.imageUrl" size="small" />
            </ion-thumbnail>
            <ion-radio :value="item.updatedSku">
              <ion-label>
                <p class="overline">{{ item.parentProductName }}</p>
                {{ item.updatedSku }}
                <p>{{ item.orderId }}</p>
              </ion-label>
            </ion-radio>
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
import { ref } from "vue";
import { DxpShopifyImg } from "@hotwax/dxp-components";
import { translate } from "@hotwax/dxp-components";

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
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonSegment,
  IonSegmentButton,
  IonHeader,
  IonTitle,
  IonThumbnail,
  IonToolbar,
  DxpShopifyImg
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
        productIdentificationIds: [this.updatedSku],
        identificationTypeId: this.unidentifiedItems[0]?.identificationTypeId
      }
      const products = await this.store.dispatch("product/fetchProducts", payload);

      // Create a mapping from identification value to pseudoId
      let pseudoId = '';
      Object.values(products).forEach((product: any) => {
        const matchingIdentifier = product.identifications?.find((id: any) => id.productIdTypeEnumId ===  this.unidentifiedItems[0]?.identificationTypeId);
        if(matchingIdentifier && matchingIdentifier.idValue === this.updatedSku) {
          pseudoId = product.pseudoId;        
        }
      });

      const product = products[pseudoId];
      if (!product) {
        this.isSkuInvalid = true;
        return;
      }
      
      const unidentifiedItem = this.unidentifiedItems.find((unidentifiedItem: any) => unidentifiedItem.identification === this.unidentifiedProductSku || unidentifiedItem.updatedSku === this.unidentifiedProductSku );
      
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
    return {
      closeOutline,
      saveOutline,
      segmentSelected,
      store,
      translate
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
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
        <ion-item id="update-sku" :class="showErrorText ? 'ion-invalid' : ''">
          <ion-input v-model="updatedSku" :clear-input="true" :placeholder="$t('Select SKU')" />
          <ion-note v-show="showHelperText" slot="helper" color="success">{{ $t("The SKU is successfully changed") }}</ion-note>
          <ion-note slot="error">{{ $t("This SKU is not available, please try again") }}</ion-note>
        </ion-item>
        <ion-button @click="update">{{ $t("Update") }}</ion-button>
      </div>
      
      <ion-segment v-model="segmentSelected">
        <ion-segment-button value="pending">
          <ion-label>{{ $t("Pending") }}</ion-label>
        </ion-segment-button>
        <ion-segment-button value="completed">
          <ion-label>{{ $t("Completed") }}</ion-label>
        </ion-segment-button>
      </ion-segment>
      
      <ion-radio-group @ionChange="updatedSku = $event.detail.value; showHelperText = false; showErrorText = false;" v-model="unidentifiedProductSku">
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
            <ion-radio slot="end" :value="item.shopifyProductSKU" />
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
      showHelperText: false,
      showErrorText: false
    }
  },
  computed: {
    ...mapGetters({
      purchaseOrders: 'order/getPurchaseOrders',
    })
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    getPendingItems(){
      return this.purchaseOrders.unidentifiedItems.filter((item: any) => !item.updatedSku);
    },
    getCompletedItems(){
      return this.purchaseOrders.unidentifiedItems.filter((item: any) => item.updatedSku);
    },
    save(){
      this.store.dispatch('order/updateMissingSkusList', { unidentifiedItems: this.purchaseOrders.unidentifiedItems });
      this.store.dispatch('order/updateCompletedItems', []);
      this.closeModal();
    },
    async update() {
      this.showHelperText = false;
      this.showErrorText = false;
      this.$el.querySelector('#update-sku').classList.remove('ion-invalid');
      const payload = {
        viewSize: 1,
        viewIndex: 0,
        productIds: [this.updatedSku]
      }
      const products = await this.store.dispatch("product/fetchProducts", payload);
      if (products.length) {
        const item = products[0];
        const unidentifiedProduct = this.purchaseOrders.unidentifiedItems.find((item: any) => item.shopifyProductSKU === this.unidentifiedProductSku);
         
        unidentifiedProduct.updatedSku = this.updatedSku;
        unidentifiedProduct.parentProductId = item.parent.id;
        unidentifiedProduct.pseudoId = item.pseudoId;
        unidentifiedProduct.parentProductName = item.parent.parentProductName;
        unidentifiedProduct.imageUrl = item.images.mainImageUrl;
        unidentifiedProduct.isNewProduct = "N";
        unidentifiedProduct.isSelected = true;

        this.showHelperText = true;
      } else {
        this.showErrorText = true;
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
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
        <ion-item id="update-sku">
          <ion-input v-model="updatedSku" :clear-input="true" :placeholder="$t('Select SKU')" />
          <ion-note slot="helper" color="success">{{ $t("The SKU is successfully changed") }}</ion-note>
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
      
      <ion-radio-group @ionChange="updatedSku = $event.detail.value.shopifyProductSKU; $el.querySelector('ion-note[slot=helper]').style.display = 'none';" v-model="unidentifiedProduct">
        <ion-list v-if="segmentSelected === 'pending'">
          <ion-item v-for="item in unidentifiedProductItems" :key="item.shopifyProductSKU">
            <ion-label>
              {{ item.shopifyProductSKU }}
              <p>{{ item.orderId }}</p>
            </ion-label>
            <ion-radio slot="end" :value="item" />
          </ion-item>
        </ion-list>

        <ion-list v-if="segmentSelected === 'completed'">
          <ion-item v-for="item in completedItems" :key="item.shopifyProductSKU">
            <ion-label>
              {{ item.shopifyProductSKU }}
              <p>{{ item.orderId }}</p>
            </ion-label>
            <ion-radio slot="end" :value="item" />
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
      updatedSku: (this as any).unidentifiedProduct?.shopifyProductSKU,
      completedItems: [] as any,
      unidentifiedProduct: {} as any
    }
  },
  computed: {
    ...mapGetters({
      unidentifiedProductItems: 'order/getUnidentifiedProductItems',
    })
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    save(){
      this.store.dispatch('order/updateMissingSkusList', { completedItems: this.completedItems, unidentifiedProductItems: this.unidentifiedProductItems })
      this.closeModal();
    },
    async update() {
      this.$el.querySelector('#update-sku').classList.remove('ion-invalid');
      const payload = {
        viewSize: 1,
        viewIndex: 0,
        productIds: [this.updatedSku]
      }
      const item = await this.store.dispatch("product/fetchProducts", payload);
      if (item.length) {

        if (this.unidentifiedProductItems.findIndex((item: any) => item.shopifyProductSKU === this.unidentifiedProduct.shopifyProductSKU) >= 0){
          this.unidentifiedProductItems.splice(this.unidentifiedProductItems.findIndex((item: any) => item.shopifyProductSKU === this.unidentifiedProduct.shopifyProductSKU), 1);
        } else {
          this.completedItems.splice(this.unidentifiedProductItems.findIndex((item: any) => item.shopifyProductSKU === this.unidentifiedProduct.shopifyProductSKU), 1);
        }

        this.unidentifiedProduct.shopifyProductSKU = this.updatedSku;
        this.unidentifiedProduct.parentProductId = item[0].groupId;
        this.unidentifiedProduct.internalName = item[0].internalName;
        this.unidentifiedProduct.parentProductName = item[0].parentProductName;
        this.unidentifiedProduct.imageUrl = item[0].mainImageUrl;
        this.unidentifiedProduct.isNewProduct = "N";
        this.unidentifiedProduct.isSelected = true;
        this.completedItems.push(this.unidentifiedProduct);
        
        this.$el.querySelector('ion-note[slot=helper]').style.display = 'unset';
      } else {
        this.$el.querySelector('#update-sku').classList.add('ion-invalid');
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

  ion-note[slot="helper"] {
    display: none;
  }
</style>
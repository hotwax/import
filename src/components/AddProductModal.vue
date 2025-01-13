<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Add product") }}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content ref="contentRef" :scroll-events="true" @ionScroll="enableScrolling()">
    <ion-searchbar v-model="queryString" :placeholder="translate('Search SKU or product name')" @keyup.enter="handleSearch" @ionInput="handleInput"/>

    <template v-if="products.length">
      <ion-list v-for="product in products" :key="product.productId">
        <ion-item lines="none">
          <ion-thumbnail slot="start">
            <Image :src="product.mainImageUrl" />
          </ion-thumbnail>
          <ion-label>
            <h2>{{ getProductIdentificationValue(productIdentificationPref.primaryId, getProductById(product.productId)) ? getProductIdentificationValue(productIdentificationPref.primaryId, getProductById(product.productId)) : getProductById(product.productId).productName }}</h2>
            <p>{{ getProductIdentificationValue(productIdentificationPref.secondaryId, getProductById(product.productId)) }}</p>
          </ion-label>
          <ion-icon v-if="isProductAvailableInShipment(product.productId)" color="success" :icon="checkmarkCircle" />
          <ion-button v-else fill="outline" @click="addToShipment(product.productId)">{{ translate("Add to shipment") }}</ion-button>
        </ion-item>
      </ion-list>

      <ion-infinite-scroll @ionInfinite="loadMoreProducts($event)" threshold="100px" v-show="isScrollable" ref="infiniteScrollRef">
        <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="translate('Loading')" />
      </ion-infinite-scroll>
    </template>

    <div v-else-if="queryString && isSearching && !products.length" class="empty-state">
      <p>{{ translate("No product found") }}</p>
    </div>
    <div v-else class="empty-state">
      <img src="../assets/images/empty-state-add-product-modal.png" alt="empty-state" />
      <p>{{ translate("Enter a SKU, or product name to search a product") }}</p>
    </div>
  </ion-content>
</template>

<script>
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  modalController,
} from "@ionic/vue";
import { closeOutline, checkmarkCircle } from "ionicons/icons"
import { defineComponent, computed } from "vue"
import { mapGetters, useStore } from "vuex";
import { useRouter } from "vue-router"
import store from "@/store"
import { translate, getProductIdentificationValue, useProductIdentificationStore } from "@hotwax/dxp-components";
import Image from "@/components/Image.vue"
import { UtilService } from "@/services/UtilService";
import { hasError } from "@/adapter";
import { showToast } from '@/utils';
import logger from "@/logger";

export default defineComponent({
  name: "AddProductModal",
  components: {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonItem,
    IonLabel,
    IonList,
    IonSearchbar,
    IonThumbnail,
    IonTitle,
    IonToolbar,
    Image,
  },
  data() {
    return {
      queryString: '',
      isSearching: false,
      isScrollingEnabled: false
    }
  },
  async ionViewWillEnter() {
    this.isScrollingEnabled = false;
  },
  unmounted() {
    store.dispatch("product/clearProducts");
  },
  props: ["shipmentId"],
  computed: {
    ...mapGetters({
      products: 'product/getProducts',
      isScrollable: 'product/isScrollable',
      getProductById: 'product/getProductById',
      isProductAvailableInShipment: 'product/isProductAvailableInShipment',
    })
  },
  methods: {
    enableScrolling() {
      const parentElement = this.$refs.contentRef.$el
      const scrollEl = parentElement.shadowRoot.querySelector("main[part='scroll']")
      let scrollHeight = scrollEl.scrollHeight, infiniteHeight = this.$refs.infiniteScrollRef.$el.offsetHeight, scrollTop = scrollEl.scrollTop, threshold = 100, height = scrollEl.offsetHeight
      const distanceFromInfinite = scrollHeight - infiniteHeight - scrollTop - threshold - height
      if(distanceFromInfinite < 0) {
        this.isScrollingEnabled = false;
      } else {
        this.isScrollingEnabled = true;
      }
    },
    async handleSearch() {
      if(!this.queryString) {
        this.isSearching = false; 
        store.dispatch("product/clearProducts");
        return;
      }
      await this.getProducts();
      this.isSearching = true;
    },
    async getProducts( vSize, vIndex) {

      const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
      const viewIndex = vIndex ? vIndex : 0;
      const payload = {
        viewSize,
        viewIndex,
        queryString: this.queryString
      }
      if(this.queryString) {
        await this.store.dispatch("product/findProduct", payload);
      }
    },
    async loadMoreProducts(event) {
      if(!(this.isScrollingEnabled && this.isScrollable)) {
        await event.target.complete();
      }
      this.getProducts(
        undefined,
        Math.ceil(this.products.length / process.env.VUE_APP_VIEW_SIZE).toString()
      ).then(() => {
        event.target.complete();
      })
    },
    async addToShipment(productId) {
      let resp;
      const payload = {
        productId: productId,
        shipmentId: this.shipmentId,
        quantity: 1
      }
      try {
        resp = await UtilService.addProductToShipment(payload)
        if(!hasError(resp)) {
          showToast(translate("Product added successfully"));
          await this.store.dispatch('util/fetchShipmentItems', { shipmentId: this.shipmentId });
        } else {
          throw resp.data;
        }
      } catch(err) {
        showToast(translate("Failed to add product to shipment"))
        logger.error(err)
      }
    },
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    handleInput() {
      if(!this.queryString) {
        this.isSearching = false;
        store.dispatch("product/clearProducts");
      }
    },
  },

  setup() {
    const store = useStore();
    const router = useRouter();
    const productIdentificationStore = useProductIdentificationStore();
    let productIdentificationPref = computed(() => productIdentificationStore.getProductIdentificationPref);
    
    return {
      closeOutline,
      checkmarkCircle,
      translate,
      store,
      getProductIdentificationValue,
      productIdentificationPref,
      router
    }
  }
})
</script>
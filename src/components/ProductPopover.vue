<template>
  <ion-content>
    <ion-item lines="none">
      <ion-label>{{ this.isVirtual ? item.internalName : item.parentProductName }}</ion-label>
    </ion-item>
    <ion-item lines="none" @click="onlyRevert">
      <ion-icon slot="start" :icon="arrowUndoOutline" />
      <ion-label>{{ $t('Reset') }}</ion-label>
    </ion-item>
    <ion-item lines="none" @click="onlySelect">
      <ion-icon slot="start" :icon="checkboxOutline" />
      <ion-label>{{ $t('Only select') }}</ion-label>
    </ion-item>
  </ion-content>
</template>

<script>
import { IonContent, IonIcon, IonLabel, IonItem, popoverController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { mapGetters, useStore } from "vuex";
import {
  checkboxOutline,
  arrowUndoOutline
} from 'ionicons/icons';
export default defineComponent({
  props: ['id', 'isVirtual', 'item'],
  name: 'parentProductPopover',
  components: { IonContent, IonIcon, IonLabel, IonItem },
  computed: {
    ...mapGetters({
      ordersList: 'order/getOrder',
    }),
  },
  methods: {
    onlyRevert() {
      this.isVirtual ? this.onlyRevertSingleProduct() : this.onlyRevertParentProduct();
    },
    onlySelect() {
      this.isVirtual ? this.onlySelectSingleProduct() : this.onlySelectParentProduct();
    },
    onlySelectParentProduct() {
      this.ordersList.items.forEach(element => {
        element.isSelected = element.parentProductId === this.id;
      });
      popoverController.dismiss({ dismissed: true });
    },
    onlySelectSingleProduct() {
      this.ordersList.items.forEach(element => {
        element.isSelected = element.internalName === this.id;
      });
      popoverController.dismiss({ dismissed: true });
    },
    onlyRevertSingleProduct() {
      const original = JSON.parse(JSON.stringify(this.ordersList.original));
      const items = this.ordersList.items.map(element => {
        if(element.internalName === this.id) {
          const item = original.find(item => {
            return item.internalName === this.id;
          })
          element = item;
        }
        return element;
      });
      this.store.dispatch('order/updatedOrderListItems', items)
      popoverController.dismiss({ dismissed: true });
    },
    onlyRevertParentProduct(){
      const original = JSON.parse(JSON.stringify(this.ordersList.original));
      const items = this.ordersList.items.map(element => {
        if(element.parentProductId === this.id) {
          const item = original.find(item => {
            return item.parentProductId === this.id;
          })
          element = item;
        }
        return element;
      });
      this.store.dispatch('order/updatedOrderListItems', items)
      popoverController.dismiss({ dismissed: true });
    }
  },
  setup() {
    const store = useStore();
    return {
      checkboxOutline,
      arrowUndoOutline,
      store
    }
  }
});
</script>
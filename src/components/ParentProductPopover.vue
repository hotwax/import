<template>
  <ion-content>
    <ion-item lines="none">
      <ion-label>{{ this.isVirtualProduct ? item.internalName : item.parentProductName }}</ion-label>
    </ion-item>
    <ion-item lines="none">
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
  arrowUndoOutline,
  checkboxOutline,
} from 'ionicons/icons';
export default defineComponent({
  props: ['id', 'isVirtualProduct', 'item'],
  name: 'parentProductPopover',
  components: { IonContent, IonIcon, IonLabel, IonItem },
  computed: {
    ...mapGetters({
      ordersList: 'order/getOrder',
    }),
  },
  methods: {
    onlySelect(){
      if(this.isVirtualProduct){
        this.onlySelectSingleProduct();
      } else {
        this.onlySelectParentProduct();
      }
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
    }
  },
  setup() {
    const store = useStore();
    return {
      arrowUndoOutline,
      checkboxOutline,
      store
    }
  }
});
</script>

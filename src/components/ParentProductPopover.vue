<template>
  <ion-content>
    <ion-item lines="none">
      <ion-label>{{ this.type === "Parent" ? item.parentProductName : item.internalName }}</ion-label>
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
  props: ['id', 'type', 'item'],
  name: 'parentProductPopover',
  components: { IonContent, IonIcon, IonLabel, IonItem },
  computed: {
    ...mapGetters({
      ordersList: 'order/getOrder',
    }),
  },
  methods: {
    onlySelect(){
      if(this.type === "Parent"){
        this.onlySelectParentProduct();
      } else {
        this.onlySelectSingleProduct();
      }
    },
    onlySelectParentProduct() {
      this.ordersList.items.forEach(element => {
        if (element.parentProductId === this.id) {
          element.isSelected = true;
        }
        else {
          element.isSelected = false;
        }
      });
      popoverController.dismiss({ dismissed: true });
    },
    onlySelectSingleProduct() {
      this.ordersList.items.forEach(element => {
        if (element.internalName === this.id) {
          element.isSelected = true;
        }
        else {
          element.isSelected = false;
        }
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

<template>
  <ion-content>
    <ion-item lines="none">
      <ion-label>{{ id ? item.parentProductName : item.internalName }}</ion-label>
    </ion-item>
    <ion-item lines="none">
      <ion-icon slot="start" :icon="arrowUndoOutline" />
      <ion-label>{{ $t('Reset') }}</ion-label>
    </ion-item>
    <ion-item lines="none"  >
      <ion-icon slot="start" :icon="checkboxOutline" />
      <ion-label  @click="onlySelect">{{ $t('Only select') }}</ion-label>
    </ion-item>
  </ion-content>
</template>

<script>
import { IonContent, IonIcon, IonLabel, IonItem } from '@ionic/vue';
import { defineComponent } from 'vue';
import {
  arrowUndoOutline,
  checkboxOutline,
} from 'ionicons/icons';
export default defineComponent({
  props: ['id', 'items', 'item'],
  name: 'parentProductPopover',
  components: { IonContent, IonIcon, IonLabel, IonItem },
  methods: {
    onlySelect(){
      if(this.id){
        this.items.forEach(element => {
          if (element.parentProductId === this.id) {
            element.isSelected = true;
          }
          else {
            element.isSelected = false;
          }
        });
      }
      else{
        this.items.forEach(element => {
          if (element === this.item) {
            element.isSelected = true;
          }
          else {
            element.isSelected = false;
          }
        })
      }
    }
  },
  setup() {
    return {
      arrowUndoOutline,
      checkboxOutline
    }
  }
});
</script>

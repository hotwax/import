<template> 
  <div>
    <ion-item lines="none">
      <h2 slot="start">PO1</h2> 
      <ion-button color="medium" fill="outline">{{ $t("Edit duplicate PO ID") }}</ion-button>
    </ion-item>
    
    <div class="list-item list-header">
      <ion-item color="light" lines="none" >
        <ion-label>Parent Product</ion-label>
      </ion-item>  
      <div class="tablet" />  
      <div class="tablet" />  
      <div />
      
      <ion-checkbox :checked="true" />  
      <ion-button fill="clear" color="medium">
        <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
      </ion-button>
    </div>
    <div>
      <div class="list-item">
        <ion-item lines="none">
          <ion-thumbnail slot="start">
            <Image :src="imageUrl" />
          </ion-thumbnail>
          <ion-label class="ion-text-wrap">
            Product internal name
          </ion-label>
        </ion-item>  
        <ion-chip outline class="tablet">
          <ion-label>Backorder</ion-label>
        </ion-chip>  
        <ion-chip outline>
          <ion-label>5 {{ $t("Ordered") }}</ion-label>
        </ion-chip>  
        <ion-chip outline class="tablet">
          <ion-icon :icon="sendOutline" />
          <ion-label>12/22/2022</ion-label>
        </ion-chip>  
        <!-- Used :key as the changed value was not reflected -->
        <ion-checkbox :checked="true"/>
        
        <ion-button fill="clear" color="medium">
          <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
        </ion-button>
      </div>
    </div>
  </div>
  
  <div>
    <ion-item lines="none">
      <h2>PO2</h2> 
    </ion-item>
    
    <div class="list-item list-header">
      <ion-item color="light" lines="none" >
        <ion-label>Parent Product</ion-label>
      </ion-item>  
      <div class="tablet" />  
      <div class="tablet" />  
      <div />
      
      <ion-checkbox :checked="true" />  
      <ion-button fill="clear" color="medium">
        <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
      </ion-button>
    </div>
    <div>
      <div class="list-item">
        <ion-item lines="none">
          <ion-thumbnail slot="start">
            <Image :src="imageUrl" />
          </ion-thumbnail>
          <ion-label class="ion-text-wrap">
            Product internal name
          </ion-label>
        </ion-item>  
        <ion-chip outline class="tablet">
          <ion-label>Backorder</ion-label>
        </ion-chip>  
        <ion-chip outline>
          <ion-label>5 {{ $t("Ordered") }}</ion-label>
        </ion-chip>  
        <ion-chip outline class="tablet">
          <ion-icon :icon="sendOutline" />
          <ion-label>12/22/2022</ion-label>
        </ion-chip>  
        <!-- Used :key as the changed value was not reflected -->
        <ion-checkbox :checked="true"/>
        
        <ion-button fill="clear" color="medium">
          <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
        </ion-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Image from '@/components/Image.vue';
import {
  IonCheckbox,
  IonThumbnail,
  IonChip,  
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
} from "@ionic/vue";
import { sendOutline, ellipsisVerticalOutline } from 'ionicons/icons';
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "MissingSkuModal",
  components: {
    IonCheckbox,
    IonThumbnail,
    IonChip,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    Image
  },
  methods: { },
  setup() {
    return {
      sendOutline,
      ellipsisVerticalOutline
    }
  }
})
</script>
<style scoped>
.header {
  margin-bottom: var(--spacer-sm);
  padding: var(--spacer-sm);
}

.filters > ion-button {
  margin-top: var(--spacer-sm);
}

.list-item {
  --columns-tablet: 4;
  --columns-desktop: 6;
  border-bottom: #92949C 1px solid;
}

.list-item :first-child ion-label {
  word-break: break-all;
}

.list-header {
  background-color: var(--ion-color-light);
}
h1 {
    margin-left: 15px;
}
@media (min-width: 991px) {
  .header {
    display: grid;
    grid: "search filters"
          /1fr 1fr;
    gap: var(--spacer-sm);
  }

  .search {
    grid-area: search;
  } 

  .filters {
    grid-area: filters;
  }
}
</style>
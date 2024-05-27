<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/inventory" />
        <ion-title>Restock details</ion-title>

        <ion-buttons slot="end">
          <ion-button >
            <ion-icon slot="icon-only" :icon="checkboxOutline" />
          </ion-button>
          <ion-button >
            <ion-icon slot="icon-only" :icon="arrowUndoOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div class="header">
        <div class="search">
          <ion-searchbar :placeholder="translate('Search products')" @ionFocus="selectSearchBarText($event)" @keyup.enter="queryString = $event.target.value; searchProducts()"/>
        </div>
        <div class="filters">
          <ion-list>
            <ion-item>
              <ion-icon slot="start" :icon="timerOutline"/>
              <ion-label> Schedule </ion-label>   
              <ion-button slot="end" color="light">10:00AM 17TH MARCH 2024</ion-button>      
            </ion-item>
            <ion-item>
              <ion-icon slot="start" :icon="businessOutline" />
              <ion-select label="Facilities" interface="popover" :placeholder = "translate('Select')">
              <ion-select-option>{{  }}</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item lines="full">
              <ion-input label="Restock buffer" placeholder="safety stock"></ion-input>
            </ion-item>
          </ion-list>
        </div>
      </div>
      <ion-label class="ion-padding-start">
        <h2>Facility Name</h2>
      </ion-label>
      <hr/>
      <div class="list-item">
        <ion-item lines="none">
          <ion-thumbnail>
            <DxpShopifyImg size="small" />
          </ion-thumbnail>
          <ion-label>
            <p>Product internal name</p>
          </ion-label>
        </ion-item>

        <ion-chip outline class="tablet">
          <ion-label>50 incoming</ion-label>
        </ion-chip>
        
        <ion-checkbox/>
      </div>
    </ion-content>
  </ion-page>
</template>
  
  <script>
  import { defineComponent } from "vue";
  import { IonBackButton, IonButton, IonButtons, IonCheckbox, IonChip, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonThumbnail, IonTitle, IonToolbar} from "@ionic/vue";
  import { translate } from "@hotwax/dxp-components";
  import { DxpShopifyImg } from "@hotwax/dxp-components";
  import { arrowUndoOutline, checkboxOutline, timerOutline, businessOutline } from "ionicons/icons"
  
  export default defineComponent({
    name: 'ScheduledRestockDetail',
    components: {
      DxpShopifyImg,
      IonBackButton,
      IonButton,
      IonButtons,
      IonCheckbox,
      IonChip,
      IonContent,
      IonHeader,
      IonIcon,
      IonInput,
      IonItem,
      IonLabel,
      IonList,
      IonPage,
      IonSearchbar,
      IonSelect,
      IonSelectOption,
      IonThumbnail,
      IonTitle,
      IonToolbar
    },
    setup() {
      return {
        translate,
        arrowUndoOutline,
        checkboxOutline,
        timerOutline,
        businessOutline
      }
    }
  })
</script>
  
<style scoped>

.list-item {
  --columns-desktop: 3;
  --columns-tablet: 4;
}

.list-item > ion-item {
  width: 100%;
}

.list-item :first-child ion-label {
  word-break: break-all;
}

.header {
  display: grid;
  grid: "search filters"
        /1fr 1fr;
}

.search {
  grid-area: search;
}

.filters {
  grid-area: filters;
}

@media (max-width: 991px) {
  .header {
    grid: "search"
          "filters"
          / auto;
    padding: 0;
  }
}
</style>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ translate("Scheduled Restock") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <ion-item>
          <ion-label>Restock</ion-label>
          <ion-label class="ion-text-right ion-padding-end">{{ }}</ion-label>
          <input class="ion-hide" type="file" id="restockInputFile"/>
          <label for="restockInputFile" fill="outline">{{ translate("Upload") }}</label>
        </ion-item>

        <ion-list>
          <ion-list-header>{{ translate("Saved mappings") }}</ion-list-header>
          <div>
            <ion-chip outline="true"> 
              <ion-icon :icon="addOutline" />
              <ion-label>{{ translate("New mapping") }}</ion-label>
            </ion-chip>
            <ion-chip outline="true"> 
              <ion-label>Netsuite</ion-label> 
            </ion-chip>
            <ion-chip outline="true"> 
              <ion-label>Fishbowl</ion-label> 
            </ion-chip>
          </div>
        </ion-list>

        <ion-list>
          <ion-list-header>{{ translate("Select the column index for the following information in the uploaded CSV.") }}</ion-list-header>
          <ion-item-divider>
            <ion-label> Required </ion-label>
          </ion-item-divider>
          <ion-item>
            <ion-select label="Product" interface="popover" :placeholder = "translate('Select')">
              <ion-select-option>{{  }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select label="Facility" interface="popover" :placeholder = "translate('Select')">
              <ion-select-option>{{  }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select label="Restock quantity" interface="popover" :placeholder = "translate('Select')">
              <ion-select-option>{{  }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item-divider>
            <ion-label> Optional, or select during review </ion-label>
          </ion-item-divider>
          <ion-item>
            <ion-label> Schedule </ion-label>   
            <ion-button slot="end" color="light">10:00AM 17TH MARCH 2024</ion-button>      
          </ion-item>
          <ion-item>
            <ion-select label="Shopify store" interface="popover" :placeholder = "translate('NotNaked')">
              <ion-select-option>{{  }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-input label="Restock name" placeholder="Created"></ion-input>
          </ion-item>
        </ion-list>
        
        <ion-button color="medium" expand="block">
          {{ translate("Review") }}
          <ion-icon slot="end" :icon="arrowForwardOutline" />
        </ion-button>

        <ion-list>
          <ion-list-header>Scheduled Restock</ion-list-header>
          <ion-item>
            <ion-label>
              <p class="overline">job id</p>
                jobname
              <p> inbound</p>
            </ion-label>
            <ion-button color="light">10:00AM 17TH MARCH 2024</ion-button> 
            <ion-button fill="clear" color="medium">
                <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
              </ion-button>     
          </ion-item>
        </ion-list>

      </main>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent } from "vue";
import { useRouter } from 'vue-router';
import { translate } from "@hotwax/dxp-components";
import { addOutline, arrowForwardOutline, ellipsisVerticalOutline } from 'ionicons/icons';
import { IonChip, IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonItem, IonItemDivider, IonLabel, IonButton, IonList, IonListHeader, IonMenuButton, IonSelect, IonSelectOption, IonIcon, } from "@ionic/vue";


export default defineComponent({
  name: "ScheduledRestock",
  components: {
    IonChip,
      IonPage,
      IonHeader,
      IonToolbar,
      IonTitle,
      IonContent,
      IonInput,
      IonItem,
      IonItemDivider,
      IonLabel,
      IonButton,
      IonMenuButton,
      IonSelect,
      IonSelectOption,
      IonIcon,
      IonListHeader,
      IonList
  },
  setup() {
    const router = useRouter();
    return {
        router,
        translate,
        addOutline,
        arrowForwardOutline,
        ellipsisVerticalOutline
    }
  } 
})
</script>

<style scoped>
main {
  max-width: 732px;
  margin: var(--spacer-sm) auto 0; 
}

ion-button{
  margin: var(--spacer-base) var(--spacer-sm);
}

label {
  cursor: pointer;
}
</style>
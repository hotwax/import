<template>
  <section>
    <ion-item>
      <ion-label>{{ $t("Mapping name") }}</ion-label>
      <ion-input value="Test" />
    </ion-item>

    <ion-list>
      <ion-item>
        <ion-label>{{ $t("Order ID") }}</ion-label>
        <ion-input value="Sample" />
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Shopify product SKU") }}</ion-label>
        <ion-input value="Sample" />
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Arrival date") }}</ion-label>
        <ion-input value="Sample" />
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Ordered quantity") }}</ion-label>
        <ion-input value="Sample" />
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Facility ID") }}</ion-label>
        <ion-input value="Sample" />
      </ion-item>
    </ion-list>

    <div class="ion-padding-top">
      <ion-button>
        <ion-icon slot="start" :icon="saveOutline"/>
        {{ $t("Save Changes") }}
      </ion-button>
      <ion-button fill="outline" color="danger">
        <ion-icon slot="start" :icon="trashOutline" />
        {{ $t("Delete mapping") }}
      </ion-button>
    </div>
  </section>
</template>

<script lang="ts">
import { 
  IonButton,
  IonIcon,
  IonInput,
  IonLabel,
  IonItem,
  IonList
} from "@ionic/vue";
import { defineComponent } from "vue";
import { close, save, saveOutline, trashOutline } from "ionicons/icons";
import { useStore } from "vuex";

export default defineComponent({
  name: "MappingConfiguration",
  components: { 
    IonButton,
    IonIcon,
    IonInput,
    IonLabel,
    IonItem,
    IonList
  },
  data() {
    return {
    }
  },
  setup() {
    const store = useStore();
    return {
      close,
      save,
      saveOutline,
      trashOutline,
      store
    };
  }
});
</script>
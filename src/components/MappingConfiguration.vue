<template>
  <section>
    <!-- Empty state -->
    <!-- <div class="empty-state" v-if="Object.keys(currentMapping).length === 0">
      <p>{{ $t("No fieldMapping found. Please create new.")}}</p>
    </div> -->

    <!-- Mappings -->
    <ion-item>
      <ion-label>{{ $t("Mapping name") }}</ion-label>
      <ion-input v-model="mappingName" />
    </ion-item>

    <ion-list>
      <ion-item>
        <ion-label>{{ $t("Order ID") }}</ion-label>
        <ion-input v-model="fieldMapping.orderId" />
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Shopify product SKU") }}</ion-label>
        <ion-input v-model="fieldMapping.productSku" />
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Arrival date") }}</ion-label>
        <ion-input v-model="fieldMapping.orderDate" />
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Ordered quantity") }}</ion-label>
        <ion-input v-model="fieldMapping.quantity" />
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Facility ID") }}</ion-label>
        <ion-input v-model="fieldMapping.facility" />
      </ion-item>
    </ion-list>

    <div class="ion-padding-top">
      <ion-button @click="saveMapping">
        <ion-icon slot="start" :icon="saveOutline"/>
        {{ $t("Save Changes") }}
      </ion-button>
      <ion-button @click="deleteMapping" fill="outline" color="danger">
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
  IonList,
  alertController,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { close, save, saveOutline, trashOutline } from "ionicons/icons";
import { useStore, mapGetters } from "vuex";
import { showToast } from '@/utils'
import { translate } from "@/i18n";

export default defineComponent({
  name: "MappingConfiguration",
  data() {
    return {
      mappingName: "",
      queryString: '',
      filteredTimeZones: [],
      timeZones: [],
      timeZoneId: '',
      fieldMapping: {
        orderId: "",
        productSku: "",
        orderDate: "",
        quantity: "",
        facility: ""
      }
    }
  },
  props: ["mappingPrefId"],
  computed: {
    ...mapGetters({
      fieldMappings: 'user/getFieldMappings',
      currentMapping: 'user/getCurrentMapping'
    })
  },
  mounted() {
    // TODO Handle null check
    this.fieldMapping = { ...this.fieldMapping, ...this.currentMapping?.mappingPrefValue }
    this.mappingName = this.currentMapping?.mappingPrefName
  },
  updated() {
    this.fieldMapping = { ...this.fieldMapping, ...this.currentMapping?.mappingPrefValue }
    this.mappingName = this.currentMapping?.mappingPrefName
  },
  methods: {
    generateUniqueMappingPrefId(): any {
      const id = Math.floor(Math.random() * 1000);
      return !this.fieldMappings[id] ? id : this.generateUniqueMappingPrefId();
    },
    async deleteMapping() {
      const message = this.$t("Are you sure you want to delete this CSV mapping? This action cannot be undone.");
      const alert = await alertController.create({
        header: this.$t("Delete mapping"),
        message,
        buttons: [
          {
            text: this.$t("Cancel"),
          },
          {
            text: this.$t("Delete"),
            handler: () => {
              this.store.dispatch("user/deleteFieldMapping", { mappingPrefId: this.currentMapping.mappingPrefId })}
          }
        ],
      });
      return alert.present();
    },
    async saveMapping() {
      if(!this.mappingName) {
        showToast(translate("Enter mapping name"));
        return
      }
      if (!this.areAllFieldsSelected()) {
        showToast(translate("Map all fields"));
        return
      }
      const message = this.$t("Are you sure you want to update this CSV mapping? This action cannot be undone.");
      const alert = await alertController.create({
        header: this.$t("Update mapping"),
        message,
        buttons: [
          {
            text: this.$t("Cancel"),
          },
          {
            text: this.$t("Update"),
            handler: () => {
              this.store.dispatch('user/updateFieldMappings', { mappingPrefId: this.currentMapping.mappingPrefId, mappingPrefName: this.mappingName, mappingPrefValue: JSON.parse(JSON.stringify(this.fieldMapping)) })
            }
          }
        ],
      });
      return alert.present();
    },
    areAllFieldsSelected() {
      return Object.values(this.currentMapping).every(field => field !== "");
    },
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
  },
  components: { 
    IonButton,
    IonIcon,
    IonInput,
    IonLabel,
    IonItem,
    IonList
  },
});
</script>


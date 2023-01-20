<template>
  <section>
    <!-- Empty state -->
    <!-- <div class="empty-state" v-if="Object.keys(currentMapping).length === 0">
      <p>{{ $t("No fieldMapping found. Please create new.")}}</p>
    </div> -->

    <!-- Mappings -->
    <ion-item>
      <ion-label>{{ $t("Mapping name") }}</ion-label>
      <ion-input :value="currentMapping.mappingPrefName" />
    </ion-item>

    <ion-list>
      <ion-item>
        <ion-label>{{ $t("Order ID") }}</ion-label>
        <ion-input :value="currentMapping.mappingPrefValue.orderId" v-model="currentMapping.orderId" />
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Shopify product SKU") }}</ion-label>
        <ion-input :value="currentMapping.mappingPrefValue.productSku" v-model="currentMapping.productSku" />
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Arrival date") }}</ion-label>
        <ion-input :value="currentMapping.mappingPrefValue.arrivalDate" v-model="currentMapping.arrivalDate" />
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Ordered quantity") }}</ion-label>
        <ion-input :value="currentMapping.mappingPrefValue.quantity" v-model="currentMapping.quantity" />
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Facility ID") }}</ion-label>
        <ion-input :placeholder="currentMapping.mappingPrefValue.facilityId" v-model="currentMapping.facilityId" />
      </ion-item>
    </ion-list>

    <div class="ion-padding-top">
      <ion-button @click="saveMapping">
        <ion-icon slot="start" :icon="saveOutline"/>
        {{ $t("Save Changes") }}
      </ion-button>
      <ion-button @click="deleteMapping" fill="outline" color="danger">
        <ion-icon slot="start" :icon="trashOutline" />
        {{ $t("Delete Mapping") }}
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
import { UserService } from "@/services/UserService";
import { hasError, showToast } from '@/utils'
import { DateTime } from 'luxon';
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
  computed: {
    ...mapGetters({
      fieldMappings: 'user/getFieldMappings',
      currentMapping: 'user/getCurrentMapping'
    })
  },
  methods: {
    generateUniqueMappingPrefId(): any {
      const id = Math.floor(Math.random() * 1000);
      return !this.fieldMappings[id] ? id : this.generateUniqueMappingPrefId();
    },
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    escapeRegExp(text: string) {
      //TODO Handle it in a better way
      // Currently when the user types special character as it part of Regex expressions it breaks the code
      // so removed the characters for now
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    },
    findTimeZone() { 
      const regularExp = new RegExp(`${this.escapeRegExp(this.queryString)}`, 'i');
      this.filteredTimeZones = this.timeZones.filter((timeZone: any) => {
        return regularExp.test(timeZone.id) || regularExp.test(timeZone.label);
      });
    },
    async getAvailableTimeZones() {
      UserService.getAvailableTimeZones().then((resp: any) => {
        if (resp.status === 200 && !hasError(resp)) {
           this.timeZones = resp.data.filter((timeZone: any) => {
              return DateTime.local().setZone(timeZone.id).isValid;
          });
          this.findTimeZone();
        }
      })
    },
    selectSearchBarText(event: any) {
      event.target.getInputElement().then((element: any) => {
        element.select();
      })
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
              this.store.dispatch("user/deleteFieldMapping", { mappingPrefId: this.currentMapping.mappingPrefId })            }
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
              this.store.dispatch('user/updateFieldMappings', { mappingPrefId: this.currentMapping.mappingPrefId, mappingPrefName: this.mappingName, mappingPrefValue: JSON.stringify(this.fieldMapping) })
            }
          }
        ],
      });
      return alert.present();
    },
    areAllFieldsSelected() {
      return Object.values(this.fieldMapping).every(field => field !== "");
    },
  },
  beforeMount () {
    this.getAvailableTimeZones();
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


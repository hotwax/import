<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ translate("Settings") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class="user-profile">
        <ion-card>
          <ion-item lines="full">
            <ion-avatar slot="start" v-if="userProfile?.partyImageUrl">
              <Image :src="userProfile.partyImageUrl"/>
            </ion-avatar>
            <!-- ion-no-padding to remove extra side/horizontal padding as additional padding 
            is added on sides from ion-item and ion-padding-vertical to compensate the removed
            vertical padding -->
            <ion-card-header class="ion-no-padding ion-padding-vertical">
              <ion-card-subtitle>{{ userProfile?.userLoginId }}</ion-card-subtitle>
              <ion-card-title>{{ userProfile?.partyName }}</ion-card-title>
            </ion-card-header>
          </ion-item>
          <ion-button color="danger" @click="logout()">{{ translate("Logout") }}</ion-button>
          <ion-button :standalone-hidden="!hasPermission(Actions.APP_PWA_STANDALONE_ACCESS)" fill="outline" @click="goToLaunchpad()">
            {{ translate("Go to Launchpad") }}
            <ion-icon slot="end" :icon="openOutline" />
          </ion-button>
          <!-- Commenting this code as we currently do not have reset password functionality -->
          <!-- <ion-button fill="outline" color="medium">{{ translate("Reset password") }}</ion-button> -->
        </ion-card>
      </div>
      
      <div class="section-header">
        <h1>{{ translate('OMS') }}</h1>
      </div>

      <section>
        <DxpOmsInstanceNavigator />
        <DxpProductStoreSelector @updateEComStore="updateEComStore" />
      </section>

      <hr />

      <DxpAppVersionInfo />
      
      <section>
        <DxpProductIdentifier />
        <DxpTimeZoneSwitcher @timeZoneUpdated="timeZoneUpdated" />
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>
              {{ translate("File upload")}}
            </ion-card-subtitle>
            <ion-card-title>
              {{ translate("Date Format") }}
            </ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            {{ translate('Enter a custom date time format that you want to use when uploading documents to HotWax Commerce.') }}
            <p>{{ translate('Luxon date time formats can be found') }} <a target="_blank" rel="noopener noreferrer" href="https://moment.github.io/luxon/#/formatting?id=table-of-tokens">{{ translate("here") }}</a></p>
          </ion-card-content> 
          <ion-item>
            <ion-input :clear-input='true' @keyup.enter="dateTimeFormat = $event.target.value; parseSampleDateTime()" v-model="dateTimeFormat" :value="dateTimeFormat" :placeholder="defaultDateTimeFormat" />
          </ion-item>
          <ion-item>
            <ion-label>{{ sampleDateTime }}</ion-label>
            <ion-badge color="warning">
              <ion-label>{{ translate("Sample") }}</ion-label>
            </ion-badge>
          </ion-item>
          <ion-button fill="clear" @click="updateDateTimeFormat()">
            {{ translate("Save") }}
            <ion-icon slot="end" :icon="saveOutline" />
          </ion-button>
        </ion-card>
      </section>  
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonAvatar, IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader,IonIcon, IonItem, IonInput, IonLabel, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { defineComponent } from 'vue';
import { codeWorkingOutline, ellipsisVertical, personCircleOutline, openOutline, saveOutline, timeOutline } from 'ionicons/icons'
import { Actions, hasPermission } from '@/authorization'
import { mapGetters, useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { DateTime } from 'luxon';
import Image from '@/components/Image.vue';
import { translate, useProductIdentificationStore } from '@hotwax/dxp-components';
import logger from '@/logger';

export default defineComponent({
  name: 'Settings',
  components: {
    IonAvatar,
    IonBadge,
    IonButton, 
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent, 
    IonHeader, 
    IonIcon,
    IonItem, 
    IonInput,
    IonLabel, 
    IonMenuButton,
    IonPage,
    IonTitle, 
    IonToolbar,
    Image
  },
  data() {
    return {
      baseURL: process.env.VUE_APP_BASE_URL,
      sampleDateTime: '',
      dateTimeFormat: '',
      defaultDateTimeFormat: process.env.VUE_APP_DATE_FORMAT ? process.env.VUE_APP_DATE_FORMAT : 'MM/dd/yyyy',
    };
  },
  computed: {
    ...mapGetters({
      userProfile: 'user/getUserProfile',
      currentDateTimeFormat: 'user/getPreferredDateTimeFormat',
      pwaState: 'user/getPwaState'
    })
  },
  mounted(){
    this.dateTimeFormat = this.currentDateTimeFormat
    this.parseSampleDateTime();
  },
  methods: {
    updateDateTimeFormat(){
      this.dateTimeFormat = this.dateTimeFormat ? this.dateTimeFormat : this.defaultDateTimeFormat
      this.store.dispatch('user/setPreferredDateTimeFormat', this.dateTimeFormat);
      this.parseSampleDateTime();
    },
    async timeZoneUpdated(tzId: string) {
      await this.store.dispatch("user/setUserTimeZone", tzId)
    },
    parseSampleDateTime(){
      this.sampleDateTime = DateTime.now().toFormat(this.dateTimeFormat);
    },
    logout () {
      this.store.dispatch('user/logout', { isUserUnauthorised: false }).then((redirectionUrl) => {
        // if not having redirection url then redirect the user to launchpad
        if(!redirectionUrl) {
          const redirectUrl = window.location.origin + '/login'
          window.location.href = `${process.env.VUE_APP_LOGIN_URL}?isLoggedOut=true&redirectUrl=${redirectUrl}`
        }
      })
    },
    goToLaunchpad() {
      window.location.href = `${process.env.VUE_APP_LOGIN_URL}`
    },
    async updateEComStore(selectedProductStore: any) {
      await useProductIdentificationStore().getIdentificationPref(selectedProductStore.productStoreId)
        .catch((error) => logger.error(error));
    },
  },
  setup(){
    const store = useStore();
    const router = useRouter();

    return {
      Actions,
      codeWorkingOutline,
      ellipsisVertical,
      personCircleOutline,
      hasPermission,
      openOutline,
      saveOutline,
      store,
      router,
      timeOutline,
      translate
    }
  }
});
</script>

<style scoped>
ion-card > ion-button {
  margin: var(--spacer-xs);
}

section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  align-items: start;
}

.user-profile {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}

hr {
  border-top: 1px solid var(--ion-color-medium);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacer-xs) 10px 0px;
}

/* Added conditional hiding in standalone mode that respects user permissions */
@media (display-mode: standalone) {
  [standalone-hidden] {
    display: none;
  }
}
</style>

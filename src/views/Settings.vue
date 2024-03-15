<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Settings") }}</ion-title>
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
          <ion-button color="danger" @click="logout()">{{ $t("Logout") }}</ion-button>
          <ion-button fill="outline" @click="goToLaunchpad()">
            {{ $t("Go to Launchpad") }}
            <ion-icon slot="end" :icon="openOutline" />
          </ion-button>
          <!-- Commenting this code as we currently do not have reset password functionality -->
          <!-- <ion-button fill="outline" color="medium">{{ $t("Reset password") }}</ion-button> -->
        </ion-card>
      </div>
      
      <div class="section-header">
        <h1>{{ $t('OMS') }}</h1>
      </div>

      <section>
        <DxpOmsInstanceNavigator />
      </section>

      <hr />

      <DxpAppVersionInfo />
      
      <section>
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              {{ $t('Timezone') }}
            </ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            {{ $t('The timezone you select is used to ensure automations you schedule are always accurate to the time you select.') }}
          </ion-card-content> 
           
          <ion-item lines="none">
            <ion-label> {{ userProfile && userProfile.userTimeZone ? userProfile.userTimeZone : '-' }} </ion-label>
            <ion-button @click="changeTimeZone()" slot="end" fill="outline" color="dark">{{ $t("Change") }}</ion-button>
          </ion-item>
        </ion-card>
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>
              {{ $t("File upload")}}
            </ion-card-subtitle>
            <ion-card-title>
              {{ $t("Date Format") }}
            </ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            {{ $t('Enter a custom date time format that you want to use when uploading documents to HotWax Commerce.') }}
            <p>{{ $t('Luxon date time formats can be found') }} <a target="_blank" rel="noopener noreferrer" href="https://moment.github.io/luxon/#/formatting?id=table-of-tokens">{{ $t("here") }}</a></p>
          </ion-card-content> 
          <ion-item>
            <ion-input :clear-input='true' @keyup.enter="dateTimeFormat = $event.target.value; parseSampleDateTime()" v-model="dateTimeFormat" :value="dateTimeFormat" :placeholder="defaultDateTimeFormat" />
          </ion-item>
          <ion-item>
            <ion-label>{{ sampleDateTime }}</ion-label>
            <ion-badge color="warning">
              <ion-label>{{ $t("Sample") }}</ion-label>
            </ion-badge>
          </ion-item>
          <ion-button fill="clear" @click="updateDateTimeFormat()">
            {{ $t("Save") }}
            <ion-icon slot="end" :icon="saveOutline" />
          </ion-button>
        </ion-card>
      </section>  
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonAvatar, IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader,IonIcon, IonItem, IonInput, IonLabel, IonMenuButton, IonPage, IonTitle, IonToolbar, modalController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { codeWorkingOutline, ellipsisVertical, personCircleOutline, openOutline, saveOutline, timeOutline } from 'ionicons/icons'
import { mapGetters, useStore } from 'vuex';
import { useRouter } from 'vue-router';
import TimeZoneModal from '@/views/TimezoneModal.vue';
import { DateTime } from 'luxon';
import Image from '@/components/Image.vue';

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
    async changeTimeZone() {
      const timeZoneModal = await modalController.create({
        component: TimeZoneModal,
      });
      return timeZoneModal.present();
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
    }
  },
  setup(){
    const store = useStore();
    const router = useRouter();

    return {
      codeWorkingOutline,
      ellipsisVertical,
      personCircleOutline,
      openOutline,
      saveOutline,
      store,
      router,
      timeOutline
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
</style>

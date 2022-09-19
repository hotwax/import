<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Settings") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-card class="user-profile">
        <ion-item lines="full">
          <ion-avatar slot="start">
            <img src="https://dev-resources.hotwax.io/resources/uploads/images/product/m/h/mh09-blue_main.jpg" />
          </ion-avatar>
          <ion-label>
            First Last
            <p>username</p>
          </ion-label>
        </ion-item>
        <ion-button fill="outline" color="danger" @click="logout()">{{ $t("Logout") }}</ion-button>
        <ion-button fill="outline" color="medium">{{ $t("Reset password") }}</ion-button>
      </ion-card>

      <p class="title">{{ $t('OMS') }}</p>

      <div class="oms-info">
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>
              <p>{{ $t("OMS instance")}}</p>
            </ion-card-subtitle>
            <ion-card-title>
              {{ instanceUrl }}
            </ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            {{ $t('This is the name of the OMS you are connected to right now. Make sure that you are connected to the right instance before proceeding.')}}
          </ion-card-content> 
           
          <ion-button fill="clear">
            {{ $t('Go to OMS')}}
            <ion-icon slot="end" :icon="openOutline" />
          </ion-button>
        </ion-card>
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>
              <p>{{ $t("Product store")}}</p>
            </ion-card-subtitle>
            <ion-card-title>
              {{ $t("Store") }}
            </ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            {{ $t('A store repesents a company or a unique catalog of products. If your OMS is connected to multiple eCommerce stores sellling different collections of products, you may have multiple Product Stores set up in HotWax Commerce.')}}
          </ion-card-content> 
          <ion-item>
            <ion-label>{{ $t('Select store') }}</ion-label>
            <ion-select value="Demo">
              <ion-select-option>Demo</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-card>
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>
              <p>{{ $t("Shop config")}}</p>
            </ion-card-subtitle>
            <ion-card-title>
              {{ $t("eCommerce") }}
            </ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            {{ $t('eCommerce stores are directly connected to one Shop Configs. If your OMS is connected to multiple eCommerce stores selling the same catalog operating as one Company, you may have multiple Shop Configs for the selected Product Store.')}}
          </ion-card-content> 
          <ion-item>
            <ion-label>{{ $t('Select eCommerce') }}</ion-label>
            <ion-select value="Demo">
              <ion-select-option>Demo</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-card>
      </div>
      
      <p class="title">{{ $t('App') }}</p>
      
      <div class="app-info">
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
              <p>{{ $t("File upload")}}</p>
            </ion-card-subtitle>
            <ion-card-title>
              {{ $t("Date Format") }}
            </ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            {{ $t('Enter a custom date time format that you want to use when uploading documents to HotWax Commerce.')}}
          </ion-card-content> 
          <ion-item>
            <ion-input clear-input='true' v-on:keyup.enter="dateTimeFormat = $event.target.value; parse()" v-model="dateTimeFormat" :value="dateTimeFormat" />
          </ion-item>
          <ion-item>
            <ion-label>{{ sampleDateTime }}</ion-label>
            <ion-badge color="warning">
              <ion-label>{{ $t("Sample") }}</ion-label>
            </ion-badge>
          </ion-item>
          <ion-button size="medium" fill="clear" @click="updateDateTimeFormat()">
            Save
            <ion-icon slot="end" :icon="saveOutline" />
          </ion-button>
        </ion-card>
      </div>  
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonAvatar, IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader,IonIcon, IonItem, IonInput, IonLabel, IonMenuButton, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar, modalController } from '@ionic/vue';
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
    IonSelect,
    IonSelectOption,
    IonTitle, 
    IonToolbar
  },
  data() {
    return {
      baseURL: process.env.VUE_APP_BASE_URL,
      sampleDateTime: '',
      dateTimeFormat: ''
    };
  },
  computed: {
    ...mapGetters({
      userProfile: 'user/getUserProfile',
      instanceUrl: 'user/getInstanceUrl',
      currentDateTimeFormat: 'user/getDateTimeFormat'
    })
  },
  mounted(){
    this.dateTimeFormat = this.currentDateTimeFormat
    this.parse();
  },
  methods: {
    updateDateTimeFormat(){
      this.store.dispatch('user/setDateTimeFormat', this.dateTimeFormat);
    },
    async changeTimeZone() {
      const timeZoneModal = await modalController.create({
        component: TimeZoneModal,
      });
      return timeZoneModal.present();
    },
    parse(){
      this.sampleDateTime = DateTime.now().toFormat(this.dateTimeFormat);
    },
    logout () {
      this.store.dispatch('user/logout').then(() => {
        this.router.push('/login');
      })
    },
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
  padding: 0px 6px;
}
.title {
  padding: 10px 10px 0px;
}

@media (min-width: 860px) {
  .oms-info, .app-info{
    display: flex;
  }
  .oms-info > *, .app-info > * {
    flex: 1
  }
  .app-info {
    max-width: 67%;
  }
  .user-profile {
    max-width: 45%;
  }
}
</style>

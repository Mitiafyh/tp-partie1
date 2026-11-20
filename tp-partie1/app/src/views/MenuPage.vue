<template>
  <!-- ion-page : l'enveloppe obligatoire de chaque page -->
  <ion-page>
    <!-- En-tête fixe en haut de l'écran -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Menu du jour</ion-title>
        <ion-searchbar v-model="recherche" placeholder="Rechercher un plat" :debounce="250" />
      </ion-toolbar>

      <ion-segment v-model="categorieChoisie" scrollable @ion-change="charger">
      <ion-segment-button value="toutes"><ion-label>Tout</ion-label></ion-segment-button>
      <ion-segment-button v-for="c in categories" :key="c.id" :value="String(c.id)">
        <ion-label>{{ c.nom }}</ion-label>
      </ion-segment-button>
    </ion-segment>
    
  </ion-header>
  
  <!-- Zone qui défile -->
    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="rafraichir">
      <ion-refresher-content />
      </ion-refresher>
      <!-- 1. Chargement en cours -->
      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <!-- 2. Erreur -->
      <div v-else-if="erreur" class="ion-padding">
        <ion-text color="danger">
          <p>{{ erreur }}</p>
        </ion-text>
        <ion-button expand="block" @click="charger">Réessayer</ion-button>
      </div>

      <!-- 3. La liste des plats -->
      <ion-list v-else>
        <div v-if="platsFiltres.length==0">
          <p>Aucun plat ne correspond.</p>
        </div>

          <ion-item :router-link="`/tabs/menu/${plat.id}`" v-for="plat in platsFiltres" :key="plat.id">
            <ion-label>
              <h2>{{ plat.nom }}</h2>
              <p>{{ plat.categorie.nom }}</p>
              <p>{{ plat.description }}</p>

            </ion-label>
              <ion-text color="primary">{{ formatAriary(plat.prix) }}</ion-text>
              <ion-badge v-if="!plat.disponible" color="medium">Épuisé</ion-badge>

            <ion-button slot="end" fill="clear" :disabled="!plat.disponible"
              @click.stop.prevent="ajouterAuPanier(plat)">
              <ion-icon slot="icon-only" :icon="addCircleOutline" />
            </ion-button>

          </ion-item>
      </ion-list>

    </ion-content>
   
  </ion-page>
</template>

<script setup>
import { ref, onMounted ,computed,onUnmounted} from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonNote, IonSpinner, IonText,
   IonButton,IonSearchbar,IonBadge,IonSegmentButton,IonSegment,
   IonRefresher,IonRefresherContent,onIonViewWillEnter,onIonViewDidLeave,
  IonIcon,toastController
} from '@ionic/vue';
import api from '@/services/api';
import { formatAriary } from '@/utils/format';
import { addCircleOutline } from 'ionicons/icons';
import { usePanier } from '@/composables/usePanier';


const plats = ref([]);
const chargement = ref(true);
const erreur = ref(null);
const recherche = ref('');
const categorieChoisie = ref('toutes');
const categories = ref([]);
const platsFiltres = computed(() =>{
  const terme = recherche.value.toLowerCase().trim();
  if(!terme) return plats.value
  return plats.value.filter((p) => p.nom.toLowerCase().includes(terme));
});


onMounted(() => console.log('MENU onMounted'));
onUnmounted(() => console.log('MENU onUnmounted'));
onIonViewWillEnter(() => console.log('MENU onViewWillEnter'));
onIonViewDidLeave(() => console.log('MENU ionViewDidLeave'));

async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    if(categorieChoisie.value === 'toutes' ){
      plats.value = await api.getPlats();
    }else{
      plats.value = await api.getPlats(Number(categorieChoisie.value));
    }
  } catch (e) {
    erreur.value = "Impossible de joindre l'API. Est-elle lancée ?";
    console.error(e);
  } finally {
    chargement.value = false;
  }
}
async function rafraichir(event) {
  await charger();
  event.target.complete(); // arrête l'animation
}

async function ajouterAuPanier(plat) {
  await usePanier().ajouter(plat);
  const toast = await toastController.create({
  message: `${plat.nom} ajouté au panier`,
  duration: 1500, position: 'top', color: 'secondary',
});
await toast.present();
}

onMounted( async () => {
  try {
    categories.value = await api.getCategories();
  } catch (e) {
    console.error("Impossible de charger les categories",e);
  }
  await charger();
});
</script>
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Commandes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ion-refresh="rafraichir">
      <ion-refresher-content />
      </ion-refresher>

      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <div v-else-if="erreur" class="ion-padding">
        <ion-text color="danger">
          <p>{{ erreur }}</p>
        </ion-text>
        <ion-button expand="block" @click="charger">Réessayer</ion-button>
      </div>

      <div v-if="commandes.length==0">
          <p>Aucune commande pour l'instant</p>
      </div>

      <ion-list v-else>
        <div v-for="c in commandes" :key="c.id">
        <ion-label>
            <h3>Commande numéro: {{ c.id }}</h3>
            <p>Table numéro : {{ c.table }}</p>
            <p>Date : {{formatDate(c.date )}}</p>
          </ion-label>
          <ion-item v-for="l in c.lignes" :key="l.plat_id">
            <ion-label >
              <p>{{ l.nom }} : {{ Number(l.quantite) }}</p>
              <p></p>

            </ion-label>
          </ion-item>
          
        </div>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonText,
  IonItem,IonLabel,IonList,IonButton,IonSpinner,IonRefresher,IonRefresherContent
 } from '@ionic/vue';
import { computed, onMounted,ref } from 'vue';
import { formatAriary, formatDate } from '@/utils/format';
import api from '@/services/api';

const chargement = ref(true);
const erreur = ref(null);
const commandes = ref([]);

async function charger(){
  chargement.value = true;
  erreur.value = null;

  try {
  commandes.value = await api.getCommandes();
  } catch (e) {
    erreur.value = "Impossible de joindre l'API. Est-elle lancée ?";
    console.error(e);
  }finally {
    chargement.value = false;
  }
}
async function rafraichir(event) {
  await charger();
  event.target.complete(); // arrête l'animation
}

onMounted(charger);
</script>

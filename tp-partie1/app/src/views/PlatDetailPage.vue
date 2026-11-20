<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/tabs/menu" text="Menu" />
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

    <ion-content>
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

         <ion-card v-if="plat">
            <ion-card-header>
                <ion-card-title>{{ plat.nom }}</ion-card-title>
                <ion-card-subtitle>{{ plat.categorie.nom }}</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
                <p><strong>Description :</strong> {{ plat.description }}</p>
                <p><strong>Prix :</strong> {{ formatAriary(plat.prix) }}</p>
                <p v-if="riz">Avec du riz : {{ formatAriary(plat.prix + riz.prix) }}</p>

                <p><strong>Disponibilité :</strong> {{ plat.disponible ? 'Disponible' : 'Épuisé' }}</p>
            </ion-card-content>

            <ion-button fill="clear" :disabled="!plat.disponible"
            @click.stop.prevent="ajouterAuPanier(plat)" expand="block">
            <p>Ajouter au panier</p>
            </ion-button>

        </ion-card>
        <div v-else>
            <p>Ce plat n'existe pas</p>
        </div>
    </ion-content>

    </ion-page>

</template>
<script setup>
import { IonPage,IonButtons,IonBackButton,IonCard,IonCardContent,
 IonHeader,IonToolbar,IonContent,IonCardHeader,IonCardSubtitle,
IonCardTitle,IonButton,IonText,IonSpinner,useIonRouter } from '@ionic/vue';
import { useRoute } from 'vue-router';
import { onMounted ,ref} from 'vue';
import api from '@/services/api';
import { formatAriary } from '@/utils/format';
import { usePanier } from '@/composables/usePanier';

const route = useRoute();
const id = route.params.id;
const plat = ref(null);
const chargement = ref(true);
const erreur = ref(null);

const ionRouter = useIonRouter();

const riz = ref(null);


// ionRouter.navigate('/tabs/commandes','forward','replace');


async function chargerPlat() {
  chargement.value = true;
  erreur.value = null;
  try {
    plat.value = await api.getPlat(id);
  } catch (e) {
    if(e.statut === 404){
        plat.value = null;
    }else{
        erreur.value = "Impossible de joindre l'API. Est-elle lancée ?";
        console.error(e);
    }

  } finally {
    chargement.value = false;
  }
}
async function ajouterAuPanier(plat) {
 await usePanier().ajouter(plat);
 ionRouter.back();
}

onMounted(async () => {
    await chargerPlat();
    riz.value = await api.getPlat(7);
});

</script>
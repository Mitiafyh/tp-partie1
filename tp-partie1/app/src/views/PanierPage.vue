<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Panier</ion-title>
          <ion-buttons slot="start">
            <ion-back-button default-href="/tabs/menu" text="Menu" />
          </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">

      <div v-if="lignes.length==0">
          <p>Le panier est vide</p>
      </div>
      <ion-list v-else>
          <ion-item  v-for="l in lignes" :key="l.plat.id">
            <ion-label>
              <h2>{{ l.plat.nom }}</h2>
              <p>{{ l.plat.prix }}</p>
            </ion-label>

              <ion-text color="primary">{{ formatAriary(l.plat.prix* l.quantite) }}</ion-text>

            <ion-button slot="end" fill="clear" :disabled="!l.plat.disponible"
              @click.stop.prevent="changerQuantite(l.plat.id,-1)">
              <ion-icon slot="icon-only" :icon="removeCircleOutline" />
            </ion-button>

            <ion-label slot="end">{{ l.quantite }}</ion-label>

            <ion-button slot="end" fill="clear" :disabled="!l.plat.disponible"
              @click.stop.prevent="changerQuantite(l.plat.id,1)">
              <ion-icon slot="icon-only" :icon="addCircleOutline" />
            </ion-button>

          </ion-item>
          <ion-item>
            <ion-label><strong>Total :</strong>  {{ formatAriary(total) }}</ion-label>

          </ion-item>
      </ion-list>

      <ion-input v-model="table" type="number" label="Numéro de table"
           label-placement="floating" fill="outline"
           :class="{ 'ion-invalid ion-touched': erreurTable }"
           :error-text="erreurTable" />
      <ion-button expand="block" class="ion-margin-top" :disabled="envoi" @click="confirmer">
        Envoyer la commande
      </ion-button>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonText,
  IonButtons, IonBackButton,IonButton,IonIcon,IonLabel,IonList,IonItem,
 IonInput,loadingController,toastController,alertController,useIonRouter} from '@ionic/vue';
import { usePanier } from '@/composables/usePanier';
import { addCircleOutline,removeCircleOutline } from 'ionicons/icons';
import { formatAriary } from '@/utils/format';
import api from '@/services/api';
import { ref } from 'vue';

const {lignes,changerQuantite,total} = usePanier();
const ionRouter = useIonRouter();
const table = ref('');
const erreurTable = ref(null);
const envoi = ref(false);

async function confirmer() {
  
const alerte = await alertController.create({
  header: 'Confirmer la commande',
  message: `Table ${table.value} : ${formatAriary(total.value)}`,
  buttons: [
    { text: 'Annuler', role: 'cancel' },
    { text: 'Envoyer', role: 'confirm' },
  ],
});

await alerte.present();
const { role } = await alerte.onDidDismiss();
if (role === 'confirm') await envoyer();

}

async function envoyer(){

  const load = await loadingController.create({
    message:'Envoi de la commande...',
    duration: 1500, position: 'top', color: 'secondary',
  });
  await load.present();
  
  try {

  const commande = {
    table: Number(table.value),
    lignes: lignes.value.map((l)=>{
      return {
        plat_id: l.plat.id,
        quantite: l.quantite,
        nom:l.plat.nom,
        prix:l.plat.prix,

      } ;
    })
  };

 
  const reponse = await api.creerCommande(commande);
  const numeroCommande = reponse?.id || '';

  await usePanier().vider();
  table.value = '';

  const toast = await toastController.create({
   message: `Commande n°${numeroCommande} envoyée `,
    duration: 1500, position: 'top', color: 'success',
  });

  await toast.present();
  ionRouter.navigate('/tabs/commandes', 'forward', 'replace') ;

  
  } catch (e) {
    if(e.status === 422 || e.response?.status === 422){
      erreurTable.value = e.response?.data?.message || e.message || "lala";
    }else{
      const toast = await toastController.create({
    message: e.message,
    duration: 1500, position: 'top', color: 'danger',
    });
    await toast.present();
    }
  }finally{
    await load.dismiss();
  }
  

}

</script>

import { ref, computed, watch } from 'vue';
import type {LignePanier,Plat} from '@/types/gargote';
import { lire,ecrire } from '@/services/stockage';

// Déclaré EN DEHORS de la fonction : un seul panier pour toute l'application
const lignes = ref<LignePanier[]>([]); // chaque ligne : { plat, quantite }
let surveillanceActive = false;

export function usePanier() {
    function ajouter(plat: Plat) {
        // TODO : si le plat est déjà dans le panier, quantite + 1,
        //        sinon ajouter une ligne { plat, quantite: 1 }
        const existe = lignes.value.find((p) => p.plat.id === plat.id);
        if (existe != null) {
            existe.quantite++;
        } else {
            lignes.value.push({
                plat:plat,
                quantite:1
            });
        }

    }

    function changerQuantite(platId: number, delta:number): void {
        // TODO : ajoute delta (+1 ou -1) à la quantité ;
        //        si la quantité tombe à 0, retirer la ligne
        const plat = lignes.value.find((p)=>p.plat.id===platId);
        if (!plat) return;

        if(plat.quantite + delta > 0){
            if(delta==-1){
                plat.quantite--;
            }else{
                plat.quantite++;
            }
        }else{
            lignes.value=lignes.value.filter((p)=>p.plat.id != platId);
        }
    }

    function vider() {
        lignes.value = [];
    }

    const nombreArticles = computed(() => {
       return lignes.value.reduce((somme, l) => somme + l.quantite, 0)
    });
    
    const total = computed(() => {
       return lignes.value.reduce((somme, l) => somme + Number(l.plat.prix) * l.quantite, 0)
    });

    return { lignes, ajouter, changerQuantite, vider, nombreArticles, total };
}

export function estPanier(x: unknown): x is LignePanier[]{
    if(!Array.isArray(x)){
        return false;
    }
    return x.every((item) => {
        if(typeof item !== 'object' || item === null){
            return false;
        }
        if(!('quantite' in item) || typeof item.quantite !== 'number' || Number.isNaN(item.quantite)){
            return false;
        }
        if (!('plat' in item) || typeof item.plat !== 'object' || item.plat === null){
            return false;
        }
        const plat = item.plat as Record<string, unknown>;

        return ('id' in plat && typeof plat.id === 'number'
                && 'prix' in plat && typeof plat.prix === 'string');

    });
}

export async function restaurerPanier(): Promise<void>{
    lignes.value = await lire<LignePanier[]>('panier', [], estPanier);

    if (!surveillanceActive) {
    surveillanceActive = true;
    watch(
      lignes,(nv) => {
         ecrire('panier', nv);
      },{ deep: true }
    );
  }
}
import { ref, computed } from 'vue';
import type {LignePanier,Plat} from '@/types/gargote';

// Déclaré EN DEHORS de la fonction : un seul panier pour toute l'application
const lignes = ref(<LignePanier[]>([])); // chaque ligne : { plat, quantite }

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

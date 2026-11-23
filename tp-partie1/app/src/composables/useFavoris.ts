import { ref, watch } from 'vue';
import { lire, ecrire } from '@/services/stockage';

export const favoris = ref<number[]>([]);
let surveillanceActive = false;

function estTableauDeNombres(x: unknown): x is number[] {
    if(!Array.isArray(x)){
        return false;
    }

    return x.every((item) => {
        return typeof item === 'number' && !Number.isFinite(item);
    });
}

export async function restaurerFavoris(): Promise<void> {
    favoris.value = await lire<number[]>('favoris', [], estTableauDeNombres);
    if (!surveillanceActive) {
        surveillanceActive = true;
        watch(
            favoris,(nv) => {
                ecrire('favoris', nv);
            },{ deep: true }
        );
    }
}

export function estFavori(platId: number): boolean {
  return favoris.value.includes(platId);
}

export async function basculer(platId: number): Promise<void>{
    if(estFavori(platId)){
        favoris.value = favoris.value.filter((f)=> f !== platId );
    }else{
    favoris.value.push(platId);
    }
    await ecrire('favoris', favoris.value);
}
import { Preferences } from '@capacitor/preferences';

export async function lire<T>(cle: string, defaut: T, valide: (x: unknown) => x is T): Promise<T> {
    const { value } = await Preferences.get({ key: cle });   // string | null
    
    if(value === null){
        return defaut;
    }

    let lu: unknown ;

    try {
        lu = JSON.parse(value);
    } catch {
        return defaut;
    }
    if(valide(lu)){
        return lu;
    }
    return defaut;
    
}

export async function ecrire<T>(cle: string, valeur: T): Promise<void> {
    await Preferences.set({ key: cle, value: JSON.stringify(valeur) });
}


import type { Categorie, Commande, NouvelleCommande, Plat } from '@/types/gargote';
/*
 * Tous les appels à l'API passent par ce fichier.
 * Les pages n'utilisent jamais fetch() directement.
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';


export class ErreurApi extends Error {
  constructor(
    message: string,
    public statut: number,
    public details: Record<string, string> = {},
  ) {
    super(message);
  }
}

/**
 * Envoie une requête et renvoie le JSON de la réponse.
 * En cas de code HTTP d'erreur (4xx, 5xx), lève une Error qui contient
 * le statut et le corps de la réponse (message, erreurs...).
 */
async function requete<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  const reponse = await fetch(BASE_URL + chemin, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const donnees = reponse.status === 204 ? null : await reponse.json();

  if (!reponse.ok) {
    // const erreur = new Error(donnees?.message ?? `Erreur HTTP ${reponse.status}`);
    // erreur.statut = reponse.status;
    // erreur.details = donnees?.erreurs ?? {};
    // throw erreur;
    throw new ErreurApi(donnees?.message  ?? `Erreur HTTP ${reponse.status}`, reponse.status, donnees?.erreurs ?? {});
  }
  return donnees as T;
}

export default {
  getCategories():Promise<Categorie[]> {
    return requete('/categories');
  },

  getPlats(categorieId?: number | null): Promise<Plat[]> {
    const chemin = categorieId === null ? '/plats' : '/plats?categorie=' + categorieId;

    return requete(chemin);
  },

  getPlat(id: number | null): Promise<Plat> {
    return requete('/plats/' + id);
  },
  
  creerCommande(commande: NouvelleCommande | null): Promise<Commande> {
    return requete('/commandes', { method: 'POST', body: JSON.stringify(commande) });
  },

  getCommandes(): Promise<Commande[]> {
    return requete('/commandes');
  },

};

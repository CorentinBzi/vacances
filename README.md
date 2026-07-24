# 🌴 Dream Vacation 2026

Un site pour organiser nos vacances entre amis : connexion, choix des dates
communes, propositions de voyages (transport, logement, activités…), votes,
météo estimée, commentaires et diaporama photo par destination.

Site en ligne : **https://CorentinBzi.github.io/vacances/**
(disponible ~2 min après le premier déploiement — voir plus bas)

---

## 🔐 Connexion

| Qui | Comment se connecter |
|-----|----------------------|
| **Toi (admin)** | Nom **`Coco`** + ton mot de passe admin. Pas de changement de mot de passe. Tu peux créer de nouveaux voyages. |
| **Un invité (1ère fois)** | Laisse le nom vide (ou peu importe) + **mot de passe invité** → choisis ton prénom (Julien, Maël, Willy, Kev, Rémi) → crée ton mot de passe perso. |
| **Un invité (ensuite)** | Son **prénom** + **son mot de passe perso**. |

> ⚠️ **Sécurité** : c'est un site statique, donc les mots de passe (sous forme
> de hash SHA-256) sont présents dans le code envoyé au navigateur. C'est une
> protection « entre amis », pas une vraie sécurité — n'utilisez pas ces mots de
> passe ailleurs.

---

## 🧭 Ce que fait le site

1. **Page de connexion** — globe interactif, polaroids de destinations, fond dégradé « voyage ».
2. **Tableau de bord** — la liste des voyages ; l'admin peut en créer d'autres.
3. **Disponibilités** — au 1er accès à un voyage, chacun marque ses indispos
   (mi-octobre → fin décembre 2026). Un **calendrier agrégé** met en avant les
   meilleures fenêtres où tout le monde est dispo.
4. **Propositions** — recherche de lieux (OpenStreetMap), construction d'un
   itinéraire chronologique (transport / logement / activité / visite / resto),
   chaque étape avec un **lien de réservation**.
5. **Détail d'un voyage** — itinéraire chronologique à gauche, **diaporama** de
   vraies photos de la destination à droite.
6. **Sur chaque proposition** — **météo estimée** pour la période, **votes** et
   **commentaires**, visibles par tous.

APIs gratuites et sans clé utilisées : OpenStreetMap Nominatim (lieux),
Open-Meteo (météo), Wikipedia + Openverse (photos).

---

## 💻 Lancer en local

```bash
npm install
npm run dev
```

Puis ouvre l'URL affichée (par ex. `http://localhost:5173/vacances/`).

Build de production :

```bash
npm run build && npm run preview
```

---

## 🚀 Déploiement (GitHub Pages, gratuit)

Le déploiement est **automatique** via GitHub Actions à chaque push sur `main`.

1. Dans le dépôt GitHub : **Settings → Pages → Build and deployment → Source =
   GitHub Actions**.
2. Pousse sur `main` (ou relance le workflow **Deploy to GitHub Pages** dans
   l'onglet Actions). Le site se publie sur
   `https://<utilisateur>.github.io/<nom-du-repo>/`.

> Le `base` du site vaut le **nom du dépôt** (ici `/vacances/`). Si tu renommes
> le dépôt, le workflow s'adapte automatiquement.

---

## 🔗 Partage entre appareils (Firebase) — ✅ DÉJÀ CONFIGURÉ

> **C'est fait.** Le projet **`dream-vacation-2026`** (offre gratuite Spark) est
> branché : Firestore (région `eur3` Europe), authentification anonyme activée,
> et règles de sécurité publiées. Le site affiche « 🔗 Mode partagé » et les
> données (dispos, voyages, votes, commentaires) sont synchronisées en temps réel
> entre tous les appareils. La config est dans
> [`src/config/firebaseConfig.ts`](src/config/firebaseConfig.ts).
>
> Console du projet : https://console.firebase.google.com/project/dream-vacation-2026

La procédure ci-dessous est conservée **pour référence** (si tu dois recréer le
projet un jour). Elle branche **Firebase Firestore** (offre gratuite « Spark ») :

1. **Créer le projet** — https://console.firebase.google.com → *Ajouter un
   projet* (gratuit, sans carte bancaire).
2. **Base de données** — *Build → Firestore Database → Créer une base →
   Démarrer en mode production* → choisir une région (ex. `europe-west`).
3. **Authentification anonyme** — *Build → Authentication → Sign-in method →
   Anonymous → Activer*. (Permet des règles sécurisées ci-dessous.)
4. **Récupérer la config** — *Paramètres du projet (⚙️) → Vos applications →
   Web (`</>`)* → enregistrer l'app → copier l'objet `firebaseConfig`.
5. **Brancher la config** — deux options :
   - **Simple** : colle les valeurs dans
     [`src/config/firebaseConfig.ts`](src/config/firebaseConfig.ts), commit &
     push.
   - **Propre** (recommandé) : ajoute-les en *secrets* GitHub
     (*Settings → Secrets and variables → Actions*) sous les noms
     `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
     `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
     `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
     Le workflow les injecte au build.
6. **Règles Firestore** — *Firestore → Règles* → colle ceci → *Publier* :

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Accès réservé à une session (anonyme) authentifiée.
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

   > Une clé API Firebase Web n'est *pas* un secret sensible (elle identifie le
   > projet, elle n'autorise rien à elle seule) : ce sont ces **règles** qui
   > protègent les données.

Une fois configuré, la pastille passe de « 💾 Mode local » à « 🔗 Mode partagé »
sur l'écran de connexion.

---

## 🛠️ Stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router · Framer Motion ·
cobe (globe) · Firebase Firestore · déploiement GitHub Pages.

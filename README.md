# Flashcards JSON (Vanilla)

Application web simple (HTML/CSS/JS) permettant d'importer des jeux de cartes (question/réponse) ou des questionnaires QCM au format JSON et d'étudier via deux modes : Flashcards & QCM.

## Fonctionnalités

- Import via fichier ou collage JSON
- Stockage local (`localStorage`) multi-decks
- Deux types de deck : Flashcards ou QCM
- Flip carte (mode flashcards) au clic / espace / entrée
- Navigation suivante / précédente + flèches clavier
- Option mélange (shuffle)
- Export d'un deck courant
- Suppression deck / reset progression
- Support de plusieurs formats JSON (voir ci-dessous)
- Thème "révision" (look fiche, surlignage, barre de progression)
- Mode plein écran automatique lors du chargement d'un deck (focus sur l'étude)
- Bouton Random (sélection aléatoire) & Retour à la sélection
- Rendu QCM avec validation, multi-réponses, feedback visuel

## Formats JSON acceptés

### 1. Mode Flashcards

```jsonc
// 1. Tableau d'objets
[
  { "question": "Capital France?", "reponse": "Paris" },
  { "question": "2+2?", "reponse": "4" }
]
// 2. Objet clé/valeur
{
  "Capital France?": "Paris",
  "2+2?": "4"
}
// 3. Tableau de paires
[
  ["Capital France?", "Paris"],
  ["2+2?", "4"]
]
```

`reponse` ou `réponse` sont acceptés.

### 2. Mode QCM

Format attendu : tableau d'objets.

```json
[
  {
    "question": "Capital de la France ?",
    "reponses": ["Paris", "Lyon", "Rome"],
    "reponses_correctes": [0]
  },
  {
    "question": "Sélectionner des langages compilés",
    "reponses": ["C", "Python", "Go", "Rust"],
    "reponses_correctes": [0, 2, 3]
  }
]
```

Règles :

- `reponses` : minimum 2 entrées.
- `reponses_correctes` : tableau d'indices (>=1 élément) pointant dans `reponses`.
- Multi-réponses supporté (checkbox). Une seule réponse -> radio.
- Les indices invalides ou JSON mal structuré sont rejetés avec un message d'erreur.

## Utilisation

1. Ouvrir `index.html` dans un navigateur moderne (offline possible).
2. Donner un nom de deck unique.
3. Importer un fichier JSON OU coller son contenu dans la zone texte.
4. Enregistrer. Le deck apparaît dans la liste.
5. Charger le deck puis cliquer sur la carte pour retourner question/réponse.
6. Utiliser les flèches (← →) ou les boutons.
7. Activer mélange si souhaité.

## Raccourcis

- Espace / Entrée : retourner la carte (flashcards uniquement)
- Flèche gauche/droite : navigation
- R : élément aléatoire
- Esc : quitter le mode plein écran (retour à la sélection)
- V : valider un QCM (mode QCM)
- N : question suivante après validation (mode QCM)

## Persistance

Les données sont sauvegardées dans `localStorage`. Effacer le stockage du site réinitialise tout.

## Thème révision

Le thème utilise une palette inspirée des surligneurs (jaune/orange) et un effet de texture légère rappelant une fiche de révision. Une barre de progression visuelle (remplissage + compteur) se met à jour au fur et à mesure. Les faces de la carte portent explicitement les labels "Question" et "Réponse" pour un contexte clair.

## Mode plein écran (Study Mode)

Lorsqu'un deck est chargé, l'interface bascule en mode étude :

- Flashcards : carte recto/verso + navigation + progression + Random / Retour
- QCM : question + réponses (radio ou checkbox) + bouton de validation + feedback + navigation

Sur mobile, l'interface occupe la quasi-totalité de l'écran. Le bouton Retour ou la touche Esc ramènent à la gestion des decks.

## Améliorations possibles

- Marquer "Je sais / Je ne sais pas" et filtrage adaptatif
- Statistiques de révision espacée
- Import/Export complet (zip)
- Thèmes personnalisés / mode clair automatique
- Persistance des réponses/score QCM (actuellement non stocké)

---

Fait en vanilla pour simplicité.

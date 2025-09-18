# Flashcards JSON (Vanilla)

Application web simple (HTML/CSS/JS) permettant d'importer des jeux de cartes (question/réponse) au format JSON et d'étudier via des flashcards.

## Fonctionnalités

- Import via fichier ou collage JSON
- Stockage local (`localStorage`) multi-decks
- Flip carte au clic / espace / entrée
- Navigation suivante / précédente + flèches clavier
- Option mélange (shuffle)
- Export d'un deck courant
- Suppression deck / reset progression
- Support de plusieurs formats JSON
- Thème "révision" (look fiche, surlignage, barre de progression)
- Mode plein écran automatique lors du chargement d'un deck (focus sur la carte)
- Bouton Random (carte aléatoire différente) & Retour à la sélection

## Formats JSON acceptés

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

## Utilisation

1. Ouvrir `index.html` dans un navigateur moderne (offline possible).
2. Donner un nom de deck unique.
3. Importer un fichier JSON OU coller son contenu dans la zone texte.
4. Enregistrer. Le deck apparaît dans la liste.
5. Charger le deck puis cliquer sur la carte pour retourner question/réponse.
6. Utiliser les flèches (← →) ou les boutons.
7. Activer mélange si souhaité.

## Raccourcis

- Espace / Entrée : retourner la carte
- Flèche gauche/droite : navigation
- R : carte aléatoire
- Esc : quitter le mode plein écran (retour à la sélection)

## Persistance

Les données sont sauvegardées dans `localStorage`. Effacer le stockage du site réinitialise tout.

## Thème révision

Le thème utilise une palette inspirée des surligneurs (jaune/orange) et un effet de texture légère rappelant une fiche de révision. Une barre de progression visuelle (remplissage + compteur) se met à jour au fur et à mesure. Les faces de la carte portent explicitement les labels "Question" et "Réponse" pour un contexte clair.

## Mode plein écran (Study Mode)

Lorsqu'un deck est chargé, l'interface bascule en mode étude : seuls la carte, la navigation, la progression et les contrôles Random / Retour sont visibles. Sur mobile, la carte occupe la quasi-totalité de l'écran (utilise `100dvh` pour une meilleure gestion des barres système). Le bouton Retour ou la touche Esc ramènent à la gestion des decks.

## Améliorations possibles

- Marquer "Je sais / Je ne sais pas" et filtrage adaptatif
- Statistiques de révision espacée
- Import/Export complet (zip)
- Thèmes personnalisés / mode clair automatique

---

Fait en vanilla pour simplicité.

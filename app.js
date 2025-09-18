// Flashcards App - Vanilla JS
// Structure de données: deck = { name: string, cards: [{question, reponse}], createdAt }

const STORAGE_KEY = 'flashcards.decks.v1';
const PREF_KEY = 'flashcards.prefs.v1';

/** @type {{name:string,cards:{question:string,reponse:string}[],createdAt:number}[]} */
let decks = [];
let currentDeck = null; // deck object
let currentIndex = 0;
let isFlipped = false;
let prefs = { shuffle: false };
let shuffledOrder = []; // indices quand shuffle

// Elements
const deckForm = document.getElementById('deck-form');
const deckNameInput = document.getElementById('deck-name');
const jsonFileInput = document.getElementById('json-file');
const jsonTextArea = document.getElementById('json-text');
const clearFormBtn = document.getElementById('clear-form');
const deckSelect = document.getElementById('deck-select');
const loadDeckBtn = document.getElementById('load-deck');
const deleteDeckBtn = document.getElementById('delete-deck');
const exportDeckBtn = document.getElementById('export-deck');
const shuffleToggle = document.getElementById('shuffle-toggle');
const resetProgressBtn = document.getElementById('reset-progress');
const cardContainer = document.getElementById('card-container');
const cardFront = document.getElementById('card-front');
const cardBack = document.getElementById('card-back');
const cardFrontContent = cardFront ? cardFront.querySelector('.content') : null;
const cardBackContent = cardBack ? cardBack.querySelector('.content') : null;
const progressFill = document.getElementById('progress-fill');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressEl = document.getElementById('progress');
const randomBtn = document.getElementById('random-btn');
const exitStudyBtn = document.getElementById('exit-study-btn');

let inStudyMode = false;

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        decks = raw ? JSON.parse(raw) : [];
    } catch { decks = []; }
    try {
        const p = localStorage.getItem(PREF_KEY);
        prefs = p ? { shuffle: false, ...JSON.parse(p) } : { shuffle: false };
    } catch { prefs = { shuffle: false }; }
    shuffleToggle.checked = !!prefs.shuffle;
    renderDeckOptions();
}

function renderDeckOptions() {
    deckSelect.innerHTML = '';
    if (!decks.length) {
        const opt = document.createElement('option');
        opt.textContent = '— aucun deck —';
        opt.disabled = true; opt.selected = true;
        deckSelect.appendChild(opt);
        loadDeckBtn.disabled = true;
        deleteDeckBtn.disabled = true;
        exportDeckBtn.disabled = true;
        resetProgressBtn.disabled = true;
        return;
    }
    decks.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.name; opt.textContent = d.name + ` (${d.cards.length})`;
        deckSelect.appendChild(opt);
    });
    loadDeckBtn.disabled = false;
    deleteDeckBtn.disabled = false;
    exportDeckBtn.disabled = false;
    resetProgressBtn.disabled = false;
}

function parseJsonInput(str) {
    let data;
    try { data = JSON.parse(str); } catch (e) { throw new Error('JSON invalide: ' + e.message); }
    let cards = [];
    if (Array.isArray(data)) {
        // Expect objects with question/reponse OR [question, reponse]
        for (const item of data) {
            if (typeof item === 'object' && item) {
                if (Array.isArray(item) && item.length >= 2) {
                    cards.push({ question: String(item[0]), reponse: String(item[1]) });
                } else if ('question' in item && ('reponse' in item || 'réponse' in item)) {
                    cards.push({ question: String(item.question), reponse: String(item.reponse ?? item['réponse']) });
                } else {
                    const keys = Object.keys(item);
                    if (keys.length === 1) {
                        const k = keys[0];
                        cards.push({ question: k, reponse: String(item[k]) });
                    } else {
                        throw new Error('Format objet non reconnu dans array');
                    }
                }
            } else {
                throw new Error('Entrée array non objet');
            }
        }
    } else if (typeof data === 'object' && data) {
        for (const [q, r] of Object.entries(data)) {
            cards.push({ question: String(q), reponse: String(r) });
        }
    } else {
        throw new Error('Format racine non supporté');
    }
    if (!cards.length) throw new Error('Aucune carte trouvée');
    return cards;
}

deckForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = deckNameInput.value.trim();
    if (!name) return alert('Nom requis');
    let jsonStr = jsonTextArea.value.trim();
    if (!jsonStr && jsonFileInput.files && jsonFileInput.files[0]) {
        jsonStr = await jsonFileInput.files[0].text();
    }
    if (!jsonStr) return alert('Fournir un JSON (fichier ou textarea)');
    let cards;
    try { cards = parseJsonInput(jsonStr); } catch (err) { return alert(err.message); }
    const existingIdx = decks.findIndex(d => d.name === name);
    const deckObj = { name, cards, createdAt: Date.now() };
    if (existingIdx >= 0) decks[existingIdx] = deckObj; else decks.push(deckObj);
    saveState();
    renderDeckOptions();
    deckSelect.value = name;
    alert('Deck enregistré (' + cards.length + ' cartes)');
    deckForm.reset();
});

clearFormBtn.addEventListener('click', () => { deckForm.reset(); });

loadDeckBtn.addEventListener('click', () => {
    const sel = deckSelect.value;
    const d = decks.find(x => x.name === sel);
    if (!d) return;
    loadDeck(d);
});

deleteDeckBtn.addEventListener('click', () => {
    const sel = deckSelect.value; if (!sel) return;
    if (!confirm('Supprimer le deck ' + sel + ' ?')) return;
    decks = decks.filter(d => d.name !== sel);
    saveState();
    if (currentDeck && currentDeck.name === sel) {
        currentDeck = null; updateCardDisplay();
    }
    renderDeckOptions();
});

exportDeckBtn.addEventListener('click', () => {
    if (!currentDeck) return alert('Charger un deck avant');
    const blob = new Blob([JSON.stringify(currentDeck.cards, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = currentDeck.name + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});

resetProgressBtn.addEventListener('click', () => {
    if (!currentDeck) return;
    currentIndex = 0; isFlipped = false; updateCardDisplay();
});

shuffleToggle.addEventListener('change', () => {
    prefs.shuffle = shuffleToggle.checked;
    saveState();
    if (currentDeck) {
        prepareOrder();
        currentIndex = 0; isFlipped = false; updateCardDisplay();
    }
});

function loadDeck(deck) {
    currentDeck = deck;
    prepareOrder();
    currentIndex = 0; isFlipped = false;
    updateCardDisplay();
    // Focus la carte pour accessibilité
    setTimeout(() => { cardContainer.focus(); }, 30);
    enterStudyMode();
}

function prepareOrder() {
    if (!currentDeck) return;
    const n = currentDeck.cards.length;
    shuffledOrder = Array.from({ length: n }, (_, i) => i);
    if (prefs.shuffle) {
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOrder[i], shuffledOrder[j]] = [shuffledOrder[j], shuffledOrder[i]];
        }
    }
}

function getCurrentCard() {
    if (!currentDeck) return null;
    if (!currentDeck.cards.length) return null;
    const idx = prefs.shuffle ? shuffledOrder[currentIndex] : currentIndex;
    return currentDeck.cards[idx];
}

function updateCardDisplay() {
    const card = getCurrentCard();
    if (!card) {
        if (cardFrontContent) cardFrontContent.textContent = currentDeck ? 'Deck vide' : 'Aucun deck';
        if (cardBackContent) cardBackContent.textContent = '';
        prevBtn.disabled = true; nextBtn.disabled = true;
        progressEl.textContent = '0 / 0';
        if (progressFill) progressFill.style.width = '0%';
        cardContainer.classList.remove('flipped');
        exportDeckBtn.disabled = !currentDeck;
        resetProgressBtn.disabled = !currentDeck;
        return;
    }
    if (cardFrontContent) cardFrontContent.textContent = card.question;
    if (cardBackContent) cardBackContent.textContent = card.reponse;
    progressEl.textContent = `${currentIndex + 1} / ${currentDeck.cards.length}`;
    if (progressFill) {
        const pct = ((currentIndex + 1) / currentDeck.cards.length) * 100;
        progressFill.style.width = pct.toFixed(2) + '%';
    }
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= currentDeck.cards.length - 1;
    if (isFlipped) cardContainer.classList.add('flipped'); else cardContainer.classList.remove('flipped');
    updateStudyButtonsState();
}

function enterStudyMode() {
    if (inStudyMode) return;
    document.body.classList.add('study-mode');
    inStudyMode = true;
    updateStudyButtonsState();
}

function exitStudyMode() {
    if (!inStudyMode) return;
    document.body.classList.remove('study-mode');
    inStudyMode = false;
    updateStudyButtonsState();
    // Ramener focus sur select deck
    setTimeout(() => deckSelect.focus(), 30);
}

function updateStudyButtonsState() {
    const enabled = !!currentDeck;
    if (randomBtn) randomBtn.disabled = !enabled;
    if (exitStudyBtn) exitStudyBtn.disabled = !enabled;
}

function randomCard() {
    if (!currentDeck) return;
    const total = currentDeck.cards.length;
    if (total <= 1) return;
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * total);
    } while (newIndex === currentIndex);
    currentIndex = newIndex;
    isFlipped = false;
    updateCardDisplay();
}

cardContainer.addEventListener('click', () => {
    if (!currentDeck) return; isFlipped = !isFlipped; updateCardDisplay();
});
cardContainer.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); cardContainer.click(); }
    if (e.key === 'ArrowRight') { nextCard(); }
    if (e.key === 'ArrowLeft') { prevCard(); }
});

function nextCard() { if (!currentDeck) return; if (currentIndex < currentDeck.cards.length - 1) { currentIndex++; isFlipped = false; updateCardDisplay(); } }
function prevCard() { if (!currentDeck) return; if (currentIndex > 0) { currentIndex--; isFlipped = false; updateCardDisplay(); } }

nextBtn.addEventListener('click', nextCard);
prevBtn.addEventListener('click', prevCard);

window.addEventListener('keydown', (e) => {
    if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === 'ArrowLeft') prevCard();
    if (e.key === ' ') { e.preventDefault(); cardContainer.click(); }
    if (e.key === 'Escape') { exitStudyMode(); }
    if (e.key.toLowerCase() === 'r') { randomCard(); }
});

if (randomBtn) randomBtn.addEventListener('click', randomCard);
if (exitStudyBtn) exitStudyBtn.addEventListener('click', exitStudyMode);

// Initial load
loadState();
updateCardDisplay();

// Exemples guidage console
console.log('Formats JSON acceptés:\n1. Array d\'objets: [{"question":"Q?","reponse":"R"}]\n2. Objet clé/valeur: {"Q?":"R"}\n3. Array de paires: [["Q?","R"], ["Q2","R2"]]');

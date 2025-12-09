const words = ['ANDROID', 'CELULAR', 'TECLADO', 'JOGO', 'FORCA', 'PYTHON', 'HTML', 'CSS', 'JAVASCRIPT', 'DESENVOLVIMENTO', 'PROGRAMACAO'];
let word = '';
let guessed = [];
let errors = 0;
const maxErrors = 6;

function init() {
    word = words[Math.floor(Math.random() * words.length)];
    guessed = [];
    errors = 0;
    updateDisplay();
    createKeyboard();
    document.getElementById('restart').style.display = 'none';
}

function updateDisplay() {
    const display = word.split('').map(l => guessed.includes(l) ? l : '_').join(' ');
    document.getElementById('word-display').textContent = display;
    document.getElementById('hangman').className = `hangman-stage-${errors}`;

    const msg = document.getElementById('message');
    if (display.replace(/ /g, '') === word) {
        msg.textContent = 'Parabens! Voce venceu!';
        msg.style.color = 'var(--success)';
        document.getElementById('restart').style.display = 'inline-block';
    } else if (errors >= maxErrors) {
        msg.textContent = `Game Over! A palavra era: ${word}`;
        msg.style.color = 'var(--error)';
        document.getElementById('restart').style.display = 'inline-block';
    } else {
        msg.textContent = guessed.length ? 'Continue!' : 'Digite ou clique nas letras!';
        msg.style.color = 'var(--success)';
    }
}

function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
        const btn = document.createElement('button');
        btn.textContent = letter;
        btn.className = 'key';
        btn.onclick = () => guessLetter(letter);
        keyboard.appendChild(btn);
    });
    document.body.focus();
}

function guessLetter(letter) {
    if (guessed.includes(letter.toUpperCase()) || errors >= maxErrors) return;
    const upperLetter = letter.toUpperCase();
    guessed.push(upperLetter);
    if (!word.includes(upperLetter)) errors++;
    updateDisplay();
    updateKeyStates(upperLetter);
}

function updateKeyStates(letter) {
    document.querySelectorAll('.key').forEach(key => {
        if (key.textContent === letter) {
            key.classList.add('used');
            if (word.includes(letter)) key.classList.add('correct');
            else key.classList.add('wrong');
        }
    });
}

document.addEventListener('keydown', (e) => {
    const letter = e.key.toUpperCase();
    if (letter.length === 1 && letter >= 'A' && letter <= 'Z') {
        guessLetter(letter);
    }
});

document.addEventListener('touchstart', (e) => {
    const letter = e.touches[0].target.textContent;
    if (letter && letter.length === 1 && letter >= 'A' && letter <= 'Z') {
        e.preventDefault();
        guessLetter(letter);
    }
}, { passive: false });

document.getElementById('restart').onclick = init;
init();
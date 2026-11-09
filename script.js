// ====== TES MOTS À TROUVER : modifie cette liste ======
const wordToFind = ["PIANO", "CHIEN", "LIVRE", "ROSE", "TRAIN"];
// ======================================================

const MAX_TRIES = 6;
const MAX_LETTERS = 5; // longueur maximale d’un mot
const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z]/g, "");
const words = wordToFind.map(norm).filter(w => w.length > 0 && w.length <= MAX_LETTERS);
const LAYOUT = ["AZERTYUIOP", "QSDFGHJKLM", "↵WXCVBN⌫"];

let target = "", prev = "", row = 0, cur = "", over = false, keyState = {};
const $board = document.getElementById("board"), $msg = document.getElementById("msg"),
    $kb = document.getElementById("kb"), $next = document.getElementById("next");

function say(t) { $msg.textContent = t; }

function newGame() {
    const pool = words.length > 1 ? words.filter(w => w !== prev) : words;
    target = pool[Math.floor(Math.random() * pool.length)];
    prev = target; row = 0; cur = ""; over = false; keyState = {};
    $next.style.display = "none"; say("");
    const n = target.length;
    $board.style.setProperty("--n", n);
    $board.innerHTML = "";
    for (let r = 0; r < MAX_TRIES; r++) {
        const d = document.createElement("div");
        d.className = "row";
        for (let c = 0; c < n; c++) d.appendChild(Object.assign(document.createElement("div"), { className: "tile" }));
        $board.appendChild(d);
    }
    document.querySelectorAll(".key").forEach(k => k.className = k.className.replace(/\b(ok|mid|no)\b/g, "").trim());
}

function buildKeyboard() {
    LAYOUT.forEach(line => {
        const d = document.createElement("div");
        d.className = "krow";
        [...line].forEach(ch => {
            const b = document.createElement("button");
            b.className = "key" + (ch === "↵" || ch === "⌫" ? " wide" : "");
            b.textContent = ch === "↵" ? "ENTRÉE" : ch;
            b.dataset.k = ch;
            b.onclick = () => press(ch);
            d.appendChild(b);
        });
        $kb.appendChild(d);
    });
}

function render() {
    const tiles = $board.children[row].children;
    [...tiles].forEach((t, i) => {
        t.textContent = cur[i] || "";
        t.classList.toggle("filled", !!cur[i]);
    });
}

function press(k) {
    if (over) return;
    if (k === "⌫") { cur = cur.slice(0, -1); render(); return; }
    if (k === "↵") { submit(); return; }
    if (cur.length < target.length) { cur += k; render(); }
}

function submit() {
    const n = target.length;
    if (cur.length < n) { say("Pas assez de lettres"); return; }
    const res = Array(n).fill("no"), left = {};
    for (let i = 0; i < n; i++) {
        if (cur[i] === target[i]) res[i] = "ok";
        else left[target[i]] = (left[target[i]] || 0) + 1;
    }
    for (let i = 0; i < n; i++) {
        if (res[i] !== "ok" && left[cur[i]] > 0) { res[i] = "mid"; left[cur[i]]--; }
    }
    const tiles = $board.children[row].children;
    const rank = { no: 1, mid: 2, ok: 3 };
    res.forEach((s, i) => {
        tiles[i].style.transitionDelay = (i * 0.12) + "s";
        tiles[i].classList.add(s);
        const L = cur[i];
        if (!keyState[L] || rank[s] > rank[keyState[L]]) keyState[L] = s;
    });
    Object.keys(keyState).forEach(L => {
        const el = document.querySelector('.key[data-k="' + L + '"]');
        if (el) el.className = "key " + keyState[L];
    });
    say("");
    if (cur === target) { over = true; say("Bravo, bien joué !"); }
    else if (row === MAX_TRIES - 1) { over = true; say("Perdu… le mot était " + target); }
    else { row++; cur = ""; }
    if (over) $next.style.display = "inline-block";
}

document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter") { e.preventDefault(); press("↵"); }
    else if (e.key === "Backspace") press("⌫");
    else if (e.key.length === 1) { const l = norm(e.key); if (l.length === 1) press(l); }
});
$next.onclick = () => { $next.blur(); newGame(); };

buildKeyboard();
newGame();
// Variables globales del Quiz
let questions = [];
let currentScore = 0;
let currentFileUrl = ''; // Para reiniciar el mismo quiz

// URLs
const MASTER_JSON = 'materias.json';

// Elementos del DOM
const menuView = document.getElementById('menu-view');
const quizView = document.getElementById('quiz-view');
const menuContainer = document.getElementById('menu-container');
const quizContent = document.getElementById('quiz-content');
const quizTitle = document.getElementById('quiz-title');

// --------------------------------------
// LÓGICA DEL MENÚ (MATERIAS)
// --------------------------------------

async function initMenu() {
    try {
        const response = await fetch(resolvePath(MASTER_JSON));
        if (!response.ok) throw new Error("No se pudo cargar materias.json");
        const data = await response.json();
        renderMenu(data);
    } catch (error) {
        menuContainer.innerHTML = `
            <div class="error-msg">
                <h3>Error cargando el menú</h3>
                <p>${error.message}</p>
                <p>Asegúrate de ejecutar esto en un Servidor Local.</p>
            </div>`;
    }
}

function renderMenu(data) {
    menuContainer.innerHTML = ''; // Limpiar loading

    // data es el objeto: { "Redes": { ... }, "Sistemas": { ... } }
    for (const [materia, parciales] of Object.entries(data)) {
        
        // 1. Crear bloque de Materia
        const materiaBlock = document.createElement('div');
        materiaBlock.className = 'materia-block';
        
        const title = document.createElement('h2');
        title.className = 'materia-title';
        title.textContent = materia;
        materiaBlock.appendChild(title);

        // 2. Iterar Parciales
        for (const [parcial, pregunteros] of Object.entries(parciales)) {
            const parcialBlock = document.createElement('div');
            parcialBlock.className = 'parcial-block';
            
            const pTitle = document.createElement('h3');
            pTitle.className = 'parcial-title';
            pTitle.textContent = parcial;
            parcialBlock.appendChild(pTitle);

            // Grid de botones
            const grid = document.createElement('div');
            grid.className = 'preguntero-grid';

            // 3. Iterar Pregunteros (Unidades)
            for (const [nombreUnidad, archivoJson] of Object.entries(pregunteros)) {
                const btn = document.createElement('button');
                btn.className = 'preguntero-btn';
                btn.textContent = nombreUnidad;
                btn.onclick = () => startQuiz(nombreUnidad, archivoJson);
                grid.appendChild(btn);
            }

            parcialBlock.appendChild(grid);
            materiaBlock.appendChild(parcialBlock);
        }

        menuContainer.appendChild(materiaBlock);
    }
}

// Navegación entre vistas
function showMenu() {
    quizView.classList.add('hidden');
    menuView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startQuiz(title, jsonUrl) {
    menuView.classList.add('hidden');
    quizView.classList.remove('hidden');
    quizTitle.textContent = title;
    currentFileUrl = jsonUrl;
    loadQuizQuestions(jsonUrl);
}


// --------------------------------------
// LÓGICA DEL QUIZ (PREGUNTAS)
// --------------------------------------

async function loadQuizQuestions(url) {
    quizContent.innerHTML = '<div style="text-align:center; padding:20px">⏳ Cargando preguntas...</div>';
    currentScore = 0;
    updateScore();

    try {
        const response = await fetch(resolvePath(url));
        if (!response.ok) throw new Error(`No se encontró el archivo: ${url}`);
        
        questions = await response.json();
        renderQuestions();

    } catch (error) {
        quizContent.innerHTML = `
            <div class="error-msg">
                <h3>❌ Error</h3>
                <p>No se pudo cargar el archivo de preguntas.</p>
                <p>Detalle: ${error.message}</p>
            </div>`;
    }
}

function renderQuestions() {
    quizContent.innerHTML = '';
    
    // Mezclar preguntas
    const shuffled = [...questions].sort(() => 0.5 - Math.random());

    shuffled.forEach((item, index) => {
        const qBlock = document.createElement('div');
        qBlock.className = 'question-block';

        const qText = document.createElement('div');
        qText.className = 'question-text';
        qText.textContent = `${index + 1}. ${item.q}`;
        qBlock.appendChild(qText);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';

        item.options.forEach((opt, optIndex) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            // Asumimos que item.a viene 0-indexado o 1-indexado. 
            // Si en tu JSON "a": 1 es la primera opción, usa (item.a - 1).
            // Si "a": 0 es la primera, usa item.a.
            // Aquí usaré item.a - 1 basándome en tus ejemplos anteriores.
            btn.onclick = () => checkAnswer(btn, optIndex, item.a - 1, item.info, optionsDiv);
            optionsDiv.appendChild(btn);
        });

        qBlock.appendChild(optionsDiv);

        const feedback = document.createElement('div');
        feedback.className = 'feedback';
        qBlock.appendChild(feedback);

        quizContent.appendChild(qBlock);
    });
}

function checkAnswer(btn, selectedIndex, correctIndex, infoText, parentDiv) {
    if (parentDiv.classList.contains('answered')) return;
    parentDiv.classList.add('answered');

    const feedbackDiv = parentDiv.nextElementSibling;
    feedbackDiv.style.display = 'block';
    const buttons = parentDiv.querySelectorAll('.option-btn');

    if (selectedIndex === correctIndex) {
        btn.classList.add('correct');
        feedbackDiv.innerHTML = `<span style="color:green; font-weight:bold">✅ ¡Correcto!</span> ${infoText}`;
        currentScore++;
    } else {
        btn.classList.add('incorrect');
        buttons[correctIndex].classList.add('correct');
        feedbackDiv.innerHTML = `<span style="color:red; font-weight:bold">❌ Incorrecto.</span> ${infoText}`;
    }
    updateScore();
}

function updateScore() {
    document.getElementById('score-board').textContent = `Puntuación: ${currentScore} / ${questions.length}`;
}

function resetQuiz() {
    if (confirm("¿Reiniciar este test?")) {
        loadQuizQuestions(currentFileUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function resolvePath(path) {
  const base = window.location.hostname === "huecap.github.io"
    ? "/Pregunteros/"
    : "/";
  return base + path;
}


// Iniciar App
initMenu();
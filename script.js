// Variables globales del Quiz
let questions = [];
let currentScore = 0;
let currentFileUrl = ''; 
let currentMateriaName = ''; // Para el nombre del archivo al descargar
let currentUnidadName = '';

// URLs
const MASTER_JSON = 'materias.json';

// Elementos del DOM
const menuView = document.getElementById('menu-view');
const quizView = document.getElementById('quiz-view');
const menuContainer = document.getElementById('menu-container');
const quizContent = document.getElementById('quiz-content');
const quizTitle = document.getElementById('quiz-title');
const globalDownloadBtn = document.getElementById('btn-global-download');

// Elementos del Modal de Carga
const modalLoader = document.getElementById('modal-loader');
const btnOpenLoader = document.getElementById('btn-open-loader');
const closeModalSpan = document.querySelector('.close-modal');
const btnProcessLoad = document.getElementById('btn-process-load');
const inputMateria = document.getElementById('input-materia');
const inputUnidad = document.getElementById('input-unidad');
const inputFile = document.getElementById('input-file');
const dataListMaterias = document.getElementById('materias-datalist');

// --------------------------------------
// LÓGICA DE INICIO Y MENÚ
// --------------------------------------

async function initMenu() {
    setupLoadButton(); // Configurar eventos del botón cargar
    try {
        const response = await fetch(resolvePath(MASTER_JSON));
        if (!response.ok) throw new Error("No se pudo cargar materias.json");
        const data = await response.json();
        renderMenu(data);
        populateMateriaDatalist(data); // Llenar el autocompletado
    } catch (error) {
        console.warn("Modo offline o error cargando master:", error);
        menuContainer.innerHTML += `<p style='color:gray'>No se cargó el menú maestro (¿es carga manual?).</p>`;
    }
}

function renderMenu(data) {
    // Limpiamos solo los bloques de materias, pero mantenemos el botón de carga si está dentro
    // Para asegurar orden, limpiamos todo y re-renderizamos si es necesario
    // Nota: Como el botón está en el HTML estático, vaciamos el container dinámico si usas uno aparte, 
    // o asumimos que 'menuContainer' es donde van las materias.
    
    menuContainer.innerHTML = ''; 

    for (const [materia, parciales] of Object.entries(data)) {
        const materiaBlock = document.createElement('div');
        materiaBlock.className = 'materia-block';
        
        const title = document.createElement('h2');
        title.className = 'materia-title';
        title.textContent = materia;
        materiaBlock.appendChild(title);

        for (const [parcial, pregunteros] of Object.entries(parciales)) {
            const parcialBlock = document.createElement('div');
            parcialBlock.className = 'parcial-block';
            
            const pTitle = document.createElement('h3');
            pTitle.className = 'parcial-title';
            pTitle.textContent = parcial;
            parcialBlock.appendChild(pTitle);

            const grid = document.createElement('div');
            grid.className = 'preguntero-grid';

            for (const [nombreUnidad, archivoJson] of Object.entries(pregunteros)) {
                const btn = document.createElement('button');
                btn.className = 'preguntero-btn';
                btn.textContent = nombreUnidad;
                btn.onclick = () => {
                    currentMateriaName = materia;
                    currentUnidadName = nombreUnidad;
                    startQuiz(nombreUnidad, archivoJson);
                };
                grid.appendChild(btn);
            }

            parcialBlock.appendChild(grid);
            materiaBlock.appendChild(parcialBlock);
        }
        menuContainer.appendChild(materiaBlock);
    }
}

// Llena el <datalist> con las materias existentes en el JSON
function populateMateriaDatalist(data) {
    dataListMaterias.innerHTML = '';
    for (const materia of Object.keys(data)) {
        const option = document.createElement('option');
        option.value = materia;
        dataListMaterias.appendChild(option);
    }
}

// --------------------------------------
// LÓGICA DE CARGA MANUAL (NUEVO CÓDIGO)
// --------------------------------------

function setupLoadButton() {
    // Abrir modal
    btnOpenLoader.onclick = () => {
        modalLoader.classList.remove('hidden');
    };

    // Cerrar modal
    closeModalSpan.onclick = () => {
        modalLoader.classList.add('hidden');
    };

    // Click fuera del modal para cerrar
    window.onclick = (event) => {
        if (event.target == modalLoader) {
            modalLoader.classList.add('hidden');
        }
    };

    // Procesar la carga
    btnProcessLoad.onclick = () => {
        const materia = inputMateria.value.trim() || "Materia_Sin_Nombre";
        const unidad = inputUnidad.value.trim() || "Unidad_Sin_Nombre";
        const file = inputFile.files[0];

        if (!file) {
            alert("Por favor selecciona un archivo JSON.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonContent = JSON.parse(e.target.result);
                
                // Asignamos a variables globales
                questions = jsonContent;
                currentMateriaName = materia;
                currentUnidadName = unidad;
                currentFileUrl = null; // Es carga local, no hay URL remota

                // Configuramos la vista
                modalLoader.classList.add('hidden');
                menuView.classList.add('hidden');
                quizView.classList.remove('hidden');
                
                quizTitle.textContent = `${materia} - ${unidad}`;
                
                // Renderizamos
                renderQuestions();
                updateScore();

            } catch (err) {
                alert("Error al leer el JSON. Verifica el formato del archivo.");
                console.error(err);
            }
        };
        reader.readAsText(file);
    };
    
    // Configurar botón global de descarga
    globalDownloadBtn.onclick = exportarJSON;
}

// --------------------------------------
// NAVEGACIÓN
// --------------------------------------

function showMenu() {
    quizView.classList.add('hidden');
    globalDownloadBtn.classList.add('hidden'); // Ocultar descarga al salir
    menuView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function startQuiz(title, jsonUrl) {
    menuView.classList.add('hidden');
    quizView.classList.remove('hidden');
    quizTitle.textContent = title;
    currentFileUrl = jsonUrl;
    await loadQuizQuestions(jsonUrl);
}

// --------------------------------------
// LÓGICA DEL QUIZ (PREGUNTAS)
// --------------------------------------

async function loadQuizQuestions(url) {
    quizContent.innerHTML = '<div style="text-align:center; padding:20px">⏳ Cargando preguntas...</div>';
    currentScore = 0;
    updateScore();
    globalDownloadBtn.classList.add('hidden'); // Ocultar hasta que cargue

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
    globalDownloadBtn.classList.remove('hidden'); // Mostrar botón de descarga

    // 1. Guardamos el índice original antes de mezclar para editar el array correcto
    const questionsWithIndex = questions.map((q, i) => ({...q, originalIndex: i}));
    const shuffled = questionsWithIndex.sort(() => 0.5 - Math.random());

    shuffled.forEach((item, index) => {
        const qBlock = document.createElement('div');
        qBlock.className = 'question-block';

        // --- BARRA DE CONTROL (Editar / Guardar) ---
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'admin-controls';

        const btnEdit = document.createElement('button');
        btnEdit.className = 'edit-btn';
        btnEdit.textContent = '✏️ Editar';

        const btnSave = document.createElement('button');
        btnSave.className = 'save-btn';
        btnSave.textContent = '✔️ Listo'; // Cambio texto para no confundir con Descargar
        btnSave.style.display = 'none';

        controlsDiv.appendChild(btnEdit);
        controlsDiv.appendChild(btnSave);
        qBlock.appendChild(controlsDiv);

        // --- TEXTO DE LA PREGUNTA ---
        const qText = document.createElement('div');
        qText.className = 'question-text';
        qText.innerHTML = `<strong>${index + 1}. </strong><span class="q-content">${item.q}</span>`;
        qBlock.appendChild(qText);

        // --- OPCIONES ---
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';
        
        const currentOptionBtns = [];

        item.options.forEach((opt, optIndex) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            
            btn.onclick = () => {
                if (btn.isContentEditable) return; 
                checkAnswer(btn, optIndex, item.a - 1, item.info, optionsDiv);
            };

            currentOptionBtns.push(btn);
            optionsDiv.appendChild(btn);
        });

        qBlock.appendChild(optionsDiv);

        // --- LOGICA DE EDITAR / GUARDAR (En Memoria) ---
        btnEdit.onclick = () => {
            btnEdit.style.display = 'none';
            btnSave.style.display = 'inline-block';

            // Activar edición pregunta
            const qSpan = qText.querySelector('.q-content');
            qSpan.contentEditable = "true";
            qSpan.classList.add('editable-active');
            qSpan.focus();

            // Activar edición opciones
            currentOptionBtns.forEach(btn => {
                btn.contentEditable = "true";
                btn.classList.add('editable-active');
            });
        };

        btnSave.onclick = () => {
            btnSave.style.display = 'none';
            btnEdit.style.display = 'inline-block';

            const qSpan = qText.querySelector('.q-content');

            // ACTUALIZAMOS EL ARRAY GLOBAL 'questions'
            questions[item.originalIndex].q = qSpan.innerText;
            
            currentOptionBtns.forEach((btn, i) => {
                questions[item.originalIndex].options[i] = btn.innerText;
                btn.contentEditable = "false";
                btn.classList.remove('editable-active');
            });

            qSpan.contentEditable = "false";
            qSpan.classList.remove('editable-active');
            
            // Feedback visual
            btnEdit.textContent = '✏️ Editado';
            setTimeout(() => btnEdit.textContent = '✏️ Editar', 2000);
        };

        // --- FEEDBACK ---
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
        feedbackDiv.innerHTML = `<span style="color:green; font-weight:bold">✅ ¡Correcto!</span> ${infoText || ''}`;
        currentScore++;
    } else {
        btn.classList.add('incorrect');
        buttons[correctIndex].classList.add('correct');
        feedbackDiv.innerHTML = `<span style="color:red; font-weight:bold">❌ Incorrecto.</span> ${infoText || ''}`;
    }
    updateScore();
}

function updateScore() {
    const el = document.getElementById('score-board');
    if(el) el.textContent = `Puntuación: ${currentScore} / ${questions.length}`;
}

function resetQuiz() {
    if (confirm("¿Reiniciar este test?")) {
        if(currentFileUrl) {
            loadQuizQuestions(currentFileUrl);
        } else {
            // Si es archivo cargado manualmente, solo repintamos
            currentScore = 0;
            updateScore();
            renderQuestions();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function resolvePath(path) {
  const base = window.location.hostname === "huecap.github.io" ? "/Pregunteros/" : "/";
  return base + path;
}

// --------------------------------------
// DESCARGA DEL JSON
// --------------------------------------

function exportarJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    
    // Generamos un nombre de archivo dinámico basado en el formulario
    const safeMateria = currentMateriaName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeUnidad = currentUnidadName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeMateria}_${safeUnidad}_editado.json`;

    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function copyJSONTemplate() {
    const codeText = document.getElementById('json-template').innerText;
    navigator.clipboard.writeText(codeText).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        
        // Feedback visual de que se copió
        btn.textContent = '✅ ¡Copiado!';
        btn.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
}

const themeBtn = document.getElementById('theme-toggle');
const body = document.body;

// 1. Verificar preferencia guardada
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeBtn.textContent = '☀️ Modo Claro';
}

// 2. Evento Click
themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeBtn.textContent = '☀️ Modo Claro';
    } else {
        localStorage.setItem('theme', 'light');
        themeBtn.textContent = '🌙 Modo Oscuro';
    }
});

// Iniciar App
initMenu();
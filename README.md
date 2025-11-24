# Quiz App

## 📖 Descripción

**Quiz App** es una herramienta educativa diseñada para ayudar a estudiantes y profesionales a repasar conceptos fundamentales mediante quizes cargados.

La aplicación cuenta con los siguientes bancos de preguntas referente a la carrera Ingeniería en sistemas de información:

**4to año**:
- Redes de Datos
  - Primer Parcial
  - Tercer Parcial

## ✨ Características del banco de preguntas actual

  * **Modo Aleatorio:** Las preguntas se presentan en orden aleatorio para evitar la memorización de patrones.
  * **Feedback Inmediato:** Cada respuesta incluye una explicación detallada (`info`) del porqué es correcta, basada en la bibliografía del curso.
  * **Seguimiento de Puntaje:** Cálculo de porcentaje de aciertos al finalizar la sesión.
  * 
## 🚀 Instalación y Uso

### Pasos para utilizar el proyecto

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/tu-usuario/redes-datos-quiz.git
    cd redes-datos-quiz
    ```

## 📂 Estructura de los Datos (JSON)

La aplicación se alimenta de archivos `preguntas.json`. Si deseas agregar o modificar preguntas, debes seguir estrictamente este esquema:

```json
[
  {
    "q": "Texto de la pregunta aquí",
    "options": [
      "Opción A",
      "Opción B",
      "Opción C",
      "Opción D"
    ],
    "a": 1, 
    "info": "Explicación breve del concepto para reforzar el aprendizaje."
  }
]
```

  * **`q`**: (String) La pregunta a realizar.
  * **`options`**: (Array de Strings) Las posibles respuestas.
  * **`a`**: (Integer) El índice de la respuesta correcta dentro del array `options` (empezando desde 0).
      * 1 = Primera opción
      * 2 = Segunda opción
      * etc.
  * **`info`**: (String) Contexto adicional o justificación de la respuesta correcta.


### Formas de cargar los quizes:

1. Mediante la carga directa en la app de un archivo `json`

2. Mediante la carga en local de archivos al proyecto 

En este caso se debe adjuntar el archivo `.json` con las preguntas correspondientes en el formato utilizado arriba en la carpeta `assets`

Y se debe vincular dicho archivo en el archivo `materias.json`

``` JSON
 "Nombre de Materia": {
        "Parcial N (O subdivision)" : {
            "Unidad 1" : "ubicacion_del_archivo_preguntas_unidad_1.json",
            "Unidad 2" : "ubicacion_del_archivo_preguntas_unidad_2.json",
            "..." : ""
        }   
  }

``` 

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras un error en alguna pregunta o quieres agregar nuevas temáticas:

1.  Haz un Fork del proyecto.
2.  Crea una rama para tu feature (`git checkout -b feature/NuevaPregunta`).
3.  Haz commit de tus cambios (`git commit -m 'Agregada pregunta sobre IPv6'`).
4.  Haz Push a la rama (`git push origin feature/NuevaPregunta`).
5.  Abre un Pull Request.

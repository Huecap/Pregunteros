# Quiz App

 

## 📖 Descripción

**Quiz App** es una herramienta educativa diseñada para ayudar a estudiantes y profesionales a repasar conceptos fundamentales mediante quizes cargados.

La aplicación utiliza un banco de 100 preguntas de opción múltiple diseñadas para reforzar el conocimiento teórico y práctico.

## ✨ Características del banco de preguntas actual

  * **Banco de Preguntas Extenso:** 100 preguntas curadas sobre protocolos y arquitectura de redes.
  * **Modo Aleatorio:** Las preguntas se presentan en orden aleatorio para evitar la memorización de patrones.
  * **Feedback Inmediato:** Cada respuesta incluye una explicación detallada (`info`) del porqué es correcta, basada en la bibliografía del curso.
  * **Seguimiento de Puntaje:** Cálculo de porcentaje de aciertos al finalizar la sesión.
  * **Categorías Abarcadas:**
      * Transporte (TCP, UDP, Sockets)
      * Aplicación (DNS, HTTP, FTP, SMTP, etc.)
      * VoIP (SIP, H.323, RTP)
      * Seguridad (Firewalls, IPsec, VPN, Criptografía)

## 🚀 Instalación y Uso

### Pasos para ejecutar

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/tu-usuario/redes-datos-quiz.git
    cd redes-datos-quiz
    ```

2.  **Cargar los datos:**
    Asegúrate de que el archivo `preguntas.json` se encuentre en la ruta que corresponda a tu proyecto. 


## 📂 Estructura de los Datos (JSON)

La aplicación se alimenta de un archivo `preguntas.json`. Si deseas agregar o modificar preguntas, debes seguir estrictamente este esquema:

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
      * 0 = Primera opción
      * 1 = Segunda opción
      * etc.
  * **`info`**: (String) Contexto adicional o justificación de la respuesta correcta.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras un error en alguna pregunta o quieres agregar nuevas temáticas:

1.  Haz un Fork del proyecto.
2.  Crea una rama para tu feature (`git checkout -b feature/NuevaPregunta`).
3.  Haz commit de tus cambios (`git commit -m 'Agregada pregunta sobre IPv6'`).
4.  Haz Push a la rama (`git push origin feature/NuevaPregunta`).
5.  Abre un Pull Request.

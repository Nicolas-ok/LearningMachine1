// Importar las dependencias necesarias
const express = require('express'); // Importar Express para manejar las rutas y las solicitudes HTTP
const teachableMachine = require('@sashido/teachablemachine-node'); // Importar el módulo de Teachable Machine para la clasificación de imágenes
const bodyParser = require('body-parser'); // Importar body-parser para analizar los cuerpos de las solicitudes HTTP

// Configurar el modelo Teachable Machine con la URL del modelo pre-entrenado
const model = new teachableMachine({ modelUrl: 'https://teachablemachine.withgoogle.com/models/DFu3SEC9B/' });

// Crear una aplicación Express
const app = express();

// Configurar body-parser para analizar el cuerpo de las solicitudes HTTP
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Definir el puerto en el que se ejecutará el servidor
const port = process.env.PORT || 3000;

// Ruta para la página principal que muestra un formulario para enviar una URL de imagen
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <!-- Estilo CSS para el formulario -->
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f0f0f0;
                }
                form {
                    width: 300px;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                label {
                    font-weight: bold;
                    display: block;
                    margin-bottom: 10px;
                }
                input[type="text"] {
                    width: calc(100% - 20px);
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    margin-bottom: 20px;
                }
                input[type="submit"] {
                    width: 100%;
                    padding: 10px;
                    background-color: #007bff;
                    color: #ffffff;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                input[type="submit"]:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>
            <!-- Formulario para enviar una URL de imagen -->
            <form action="/image/classify" method="POST">
                <label for="imageUrl">Enter your dino image URL here:</label>
                <input type="text" id="imageUrl" name="ImageUrl" autocomplete="off" required>
                <input type="submit" value="Predict Dino">
            </form>
        </body>
        </html>
    `);
});

// Ruta para clasificar una imagen enviada a través de POST
app.post('/image/classify', async (req, res) => {
    const url = req.body.ImageUrl;

    try {
        // Realizar la clasificación de la imagen usando el modelo Teachable Machine
        const predictions = await model.classify({ imageUrl: url });

        // Verificar si se obtuvieron predicciones
        if (predictions.length === 0) {
            throw new Error("Unable to make predictions for the provided image.");
        }

        // Formatear las predicciones para enviarlas como respuesta JSON
        const formattedPredictions = predictions.map(prediction => {
            return {
                class: prediction.class,
                score: (prediction.score * 100).toFixed(2) + "%" // Convertir el score a porcentaje
            };
        });

        // Generar un HTML con los resultados formateados
        let outputHTML = '<h2>Predictions:</h2>';
        outputHTML += '<ul>';
        formattedPredictions.forEach(prediction => {
            outputHTML += `<li>${prediction.class}: ${prediction.score}</li>`;
        });
        outputHTML += '</ul>';

        // Enviar las predicciones formateadas como respuesta HTML al cliente
        res.send(`
            <html>
            <head>
                <!-- Estilo CSS para el contenedor de resultados -->
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-color: #f0f0f0;
                    }
                    #output-container {
                        width: 400px;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h2 {
                        margin-bottom: 10px;
                    }
                    ul {
                        list-style-type: none;
                        padding: 0;
                        margin: 0;
                    }
                    li {
                        margin-bottom: 5px;
                    }
                </style>
            </head>
            <body>
                <!-- Contenedor para mostrar los resultados -->
                <div id="output-container">${outputHTML}</div>
            </body>
            </html>
        `);
    } catch (error) {
        // Manejar cualquier error que ocurra durante la clasificación de la imagen
        console.error("Error occurred during image classification:", error.message);
        // Enviar una respuesta de error al cliente con un mensaje descriptivo
        res.status(500).send(`
            <html>
            <head>
                <!-- Estilo CSS para el mensaje de error -->
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-color: #f0f0f0;
                    }
                    #error-message {
                        width: 400px;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                </style>
            </head>
            <body>
                <!-- Mostrar el mensaje de error -->
                <div id="error-message">An error occurred during image classification: ${error.message}</div>
            </body>
            </html>
        `);
    }
});

// Iniciar el servidor y escuchar las solicitudes en el puerto especificado
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`You can access the server at http://localhost:${port}/`);
});

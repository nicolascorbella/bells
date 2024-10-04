import express from "express";
import cors from "cors";
import path from "path"; // Para manejar rutas de archivos
import { fileURLToPath } from "url"; // Para obtener el directorio actual

// SDK de Mercado Pago
import { MercadoPagoConfig } from "mercadopago";

// Agrega credenciales
const client = new MercadoPagoConfig({
  accessToken: "TEST-1935091980734919-092313-fb425d565ca6bfba87ca53cc21b75e8c-229579824",
});

// Obtener el directorio actual en ESM (equivalente a __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware para permitir CORS y parsear JSON
app.use(cors());
app.use(express.json());

// Sirve archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, './public')));

// Ruta para servir el archivo index.html cuando se accede a la raíz "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // Esto carga el 'index.html' desde 'public'
});

// Ruta para la tienda
app.get("/tienda", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tienda.html")); // Ruta directa al archivo tienda.html
});

// Ruta para el carrito
app.get("/carrito", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "carrito.html")); // Ruta directa al archivo carrito.html
});

// Ruta para crear una preferencia de pago en Mercado Pago
app.post("/create_preference", async (req, res) => {
  try {
    const { title, quantity, price } = req.body;

    if (!title || !quantity || !price) {
      return res.status(400).json({ error: "Faltan parámetros requeridos" });
    }

    // Creación de preferencia
    const preference = {
      items: [
        {
          title,
          quantity: Number(quantity),
          unit_price: Number(price),
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: "https://tusitio.com/success",
        failure: "https://tusitio.com/failure",
        pending: "https://tusitio.com/pending",
      },
      auto_return: "approved",
    };

    const result = await client.preferences.create(preference); // Usando "client" para crear la preferencia
    console.log(result); // Para depuración

    res.json({ id: result.body.id });
  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    res.status(500).json({ error: "No se pudo crear la preferencia" });
  }
});

// Exporta el servidor de Express para que funcione como una serverless function en Vercel
export default app;


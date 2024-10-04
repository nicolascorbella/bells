import express from "express";
import cors from "cors";
import path from "path"; // Para manejar rutas de archivos
import { fileURLToPath } from "url"; // Para obtener el directorio actual
import mercadopago from "mercadopago"; // Cambiado a la importación correcta

// Configura el SDK de Mercado Pago
mercadopago.configure({
  access_token: "TEST-1935091980734919-092313-fb425d565ca6bfba87ca53cc21b75e8c-229579824",
});

// Obtener el directorio actual en ESM (equivalente a __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware para permitir CORS y parsear JSON
app.use(cors({
  origin: "https://www.bairesrealestate.online", // Permitir solo tu dominio
}));
app.use(express.json());

// Sirve archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, './public')));

// Ruta para servir el archivo index.html cuando se accede a la raíz "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta para la tienda
app.get("/tienda", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tienda.html"));
});

// Ruta para el carrito
app.get("/carrito", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "carrito.html"));
});

// Ruta para crear una preferencia de pago en Mercado Pago
app.post("/create_preference", async (req, res) => {
  try {
    const { title, quantity, price } = req.body;

    // Validar que los parámetros estén presentes y sean correctos
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
        success: "https://www.bairesrealestate.online/success", // Ajusta esta URL
        failure: "https://www.bairesrealestate.online/failure", // Ajusta esta URL
        pending: "https://www.bairesrealestate.online/pending", // Ajusta esta URL
      },
      auto_return: "approved",
    };

    const result = await mercadopago.preferences.create(preference); // Cambiado a mercadopago
    console.log(result); // Para depuración

    res.json({ id: result.body.id });
  } catch (error) {
    console.error("Error al crear la preferencia:", error.message); // Mensaje de error
    res.status(500).json({ error: "No se pudo crear la preferencia", details: error.message });
  }
});

// Iniciar el servidor en un puerto específico
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Exporta el servidor de Express para que funcione como una serverless function en Vercel
export default app;

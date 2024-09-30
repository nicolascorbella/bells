import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { MercadoPagoConfig, Preference } from "mercadopago"; // Mantengo Mercado Pago sin cambios

// Configura credenciales de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: "TEST-1935091980734919-092313-fb425d565ca6bfba87ca53cc21b75e8c-229579824",
});

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware para permitir peticiones desde diferentes orígenes y procesar JSON
app.use(cors());
app.use(express.json());

// Configuración para servir archivos estáticos
app.use("/css", express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname))); // Sirve la raíz para otros archivos estáticos

// Rutas para servir archivos HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get("/tienda", (req, res) => {
  res.sendFile(path.join(__dirname, 'tienda.html'));
});

app.get("/carrito", (req, res) => {
  res.sendFile(path.join(__dirname, 'carrito.html'));
});

// Ruta para crear la preferencia de Mercado Pago
app.post("/create_preference", async (req, res) => {
  try {
    // Verifica que se proporcionen los parámetros requeridos
    const { title, quantity, price } = req.body;
    if (!title || !quantity || !price) {
      return res.status(400).json({ error: "Faltan parámetros requeridos" });
    }

    // Crea la preferencia de Mercado Pago
    const body = {
      items: [
        {
          title: title,
          quantity: Number(quantity),
          unit_price: Number(price),
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: "https://bairesrealestate.online/success",
        failure: "https://bairesrealestate.online/failure",
        pending: "https://bairesrealestate.online/pending",
      },
      auto_return: "approved",
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });

    // Devuelve la ID de la preferencia
    res.json({ id: result.id });
  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    res.status(500).json({
      error: "Error al crear la preferencia",
      details: error.message,
    });
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`El servidor está corriendo en el puerto ${port}`);
});
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { MercadoPagoConfig, Preference } from "mercadopago"; // Mantengo Mercado Pago sin cambios

// Agrega credenciales de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: "TEST-1935091980734919-092313-fb425d565ca6bfba87ca53cc21b75e8c-229579824",
});

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware para permitir peticiones desde diferentes orígenes y procesar JSON
app.use(cors());
app.use(express.json());

// Configuración para servir la carpeta 'css'
app.use("/css", express.static(path.join(__dirname, 'css')));

// Configuración para servir otros archivos estáticos desde la carpeta raíz
app.use(express.static(path.join(__dirname)));

// Ruta para servir 'index.html'
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para servir 'tienda.html'
app.get("/tienda", (req, res) => {
  res.sendFile(path.join(__dirname, 'tienda.html'));
});

// Ruta para servir 'carrito.html'
app.get("/carrito", (req, res) => {
  res.sendFile(path.join(__dirname, 'carrito.html'));
});

// Ruta para crear la preferencia de Mercado Pago
app.post("/create_preference", async (req, res) => {
  try {
    const body = {
      items: [
        {
          title: req.body.title,
          quantity: Number(req.body.quantity),
          unit_price: Number(req.body.price),
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

    res.json({
      id: result.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error al crear la preferencia :(",
    });
  }
});

// Exportamos el handler de Express para Vercel
export default app;

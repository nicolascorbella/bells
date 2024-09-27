import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from "mercadopago";

// Agrega credenciales de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: "TEST-1935091980734919-092313-fb425d565ca6bfba87ca53cc21b75e8c-229579824",
});

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000; // Puerto dinámico

app.use(cors());
app.use(express.json());

// Configuración para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo 'index.html'
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
        success: "https://www.youtube.com/@onthecode",
        failure: "https://www.youtube.com/@onthecode",
        pending: "https://www.youtube.com/@onthecode",
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

// Inicia el servidor en el puerto configurado
app.listen(port, () => {
  console.log(`El servidor está corriendo en el puerto ${port}`);
});

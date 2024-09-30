import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: "TEST-1935091980734919-092313-fb425d565ca6bfba87ca53cc21b75e8c-229579824",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: 'https://www.bairesrealestate.online',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Permitir envío de credenciales si es necesario
};

app.use(cors(corsOptions));
app.use(express.json());

// Ruta para manejar las solicitudes preflight (OPTIONS)
app.options('/create_preference', cors(corsOptions), (req, res) => {
  res.sendStatus(204);  // Respuesta adecuada para preflight request
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

// Otras rutas y lógica...
app.use("/main.js", (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'js', 'main.js'));
});

// Exportamos el handler de Express para Vercel
export default app;

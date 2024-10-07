import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mercadopago from 'mercadopago';

// Configura Mercado Pago
mercadopago.configurations.setAccessToken("TEST-1935091980734919-092313-fb425d565ca6bfba87ca53cc21b75e8c-229579824");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: "https://www.bairesrealestate.online", // Permitir solo tu dominio
}));
app.use(express.json());

// Ruta para crear una preferencia de pago en Mercado Pago
app.post("/create_preference", async (req, res) => {
  try {
    const { title, quantity, price } = req.body;

    if (!title || !quantity || !price) {
      return res.status(400).json({ error: "Faltan parámetros requeridos" });
    }

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
        success: "https://www.bairesrealestate.online/success",
        failure: "https://www.bairesrealestate.online/failure",
        pending: "https://www.bairesrealestate.online/pending",
      },
      auto_return: "approved",
    };

    const result = await mercadopago.preferences.create(preference);
    console.log(result);

    res.json({ id: result.body.id });
  } catch (error) {
    console.error("Error al crear la preferencia:", error.message);
    res.status(500).json({ error: "No se pudo crear la preferencia", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

export default app;

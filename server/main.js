// Importaciones necesarias
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: "APP_USR-1935091980734919-092313-dac02186b864d3a6e68be45881369cb0-229579824",
});

// Configuración de __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialización de la app de Express
const app = express();

// Middlewares
app.use(cors({ origin: "https://www.theguardianbell.com.ar" }));
app.use(express.json());

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nicolascorbellaortiz@gmail.com",
    pass: "gpxt pdaz cdxj mbqb", // Contraseña de aplicación
  },
});

// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname, './public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// Rutas para servir archivos HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/tienda", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tienda.html"));
});
app.get("/historia", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "historia.html"));
});

app.get("/carrito", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "carrito.html"));
});
app.get("/carrito-con-envio", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "carrito-con-envio.html"));
});
app.get("/carrito-con-retiro", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "carrito-con-retiro.html"));
});

// Ruta para crear una preferencia de pago en Mercado Pago
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

    res.json({ id: result.id });
  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    res.status(500).json({ error: "Error al crear la preferencia :(" });
  }
});

app.post("/enviar_correo", (req, res) => {
  const { nombre, metodoEntrega, localidad, calle, telefono, price } = req.body;

  // Verificar si los datos se reciben correctamente
  console.log("Teléfono recibido:", telefono);

  const mailOptions = {
    from: "nicolascorbellaortiz@gmail.com",
    to: "nicolascorbellaortiz@gmail.com",
    subject: "Nueva compra confirmada",
    html: `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            h3 { color: #0056b3; }
            ul { list-style: none; padding: 0; }
            li { margin-bottom: 10px; padding: 8px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; }
            li strong { color: #555; }
            .price { font-size: 1.2em; font-weight: bold; color: #007b00; }
          </style>
        </head>
        <body>
          <h3>Detalles de la compra:</h3>
          <ul>
            <li><strong>Nombre:</strong> ${nombre || "No especificado"}</li>
            <li><strong>Método de entrega:</strong> ${metodoEntrega || "No especificado"}</li>
            ${metodoEntrega === "envio" ? `
              <li><strong>Localidad:</strong> ${localidad || "No especificado"}</li>
              <li><strong>Calle:</strong> ${calle || "No especificado"}</li>
            ` : ""}
            <li><strong>Número de teléfono:</strong> ${telefono || "No especificado"}</li>
            <li class="price"><strong>Precio:</strong> ${parseFloat(price).toFixed(2) || "No especificado"} $ ARS</li>
          </ul>
        </body>
      </html>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
      res.status(500).json({ success: false, error: "Error al enviar el correo" });
    } else {
      console.log("Correo enviado: " + info.response);
      res.status(200).json({ success: true, message: "Correo enviado correctamente" });
    }
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Exportar app
export default app;
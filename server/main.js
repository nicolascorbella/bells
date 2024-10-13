import express from "express";
import cors from "cors";
import path from "path"; // Para manejar rutas de archivos
import { fileURLToPath } from "url"; // Para obtener el directorio actual
import nodemailer from "nodemailer"; // Importar Nodemailer

// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from "mercadopago";

// Agrega credenciales de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: "APP_USR-1935091980734919-092313-dac02186b864d3a6e68be45881369cb0-229579824",
});

// Obtener el directorio actual en ESM (equivalente a __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware para permitir CORS y parsear JSON
app.use(cors({
  origin: "https://www.theguardianbell.com.ar", // Permitir solo tu dominio
}));
app.use(express.json());

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nicolascorbellaortiz@gmail.com", // Tu correo Gmail
    pass: "gpxt pdaz cdxj mbqb", // Contraseña de aplicación
  },
});

// Sirve archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, './public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

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

// Ruta para la calavera
app.get("/calavera", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "campanas", "calavera", "index.html")); // Ruta directa al archivo calavera.html
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

// Nueva ruta para enviar el correo con los detalles de la compra
app.post("/enviar_correo", (req, res) => {
  const { nombre, metodoEntrega, localidad, calle, horario } = req.body;

  // Configurar el mensaje según la información enviada
const mailOptions = {
  from: "nicolascorbellaortiz@gmail.com",
  to: "nicolascorbellaortiz@gmail.com",
  subject: "Nueva compra confirmada",
  html: `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
          }
          h3 {
            color: #0056b3;
          }
          ul {
            list-style: none;
            padding: 0;
          }
          li {
            margin-bottom: 10px;
            padding: 8px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          li strong {
            color: #555;
          }
          .price {
            font-size: 1.2em;
            font-weight: bold;
            color: #007b00;
          }
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
            <li><strong>Número de teléfono:</strong> ${telefono || "No especificado"}</li>
          ` : ""}
          <li class="price"><strong>Precio:</strong> ${parseFloat(req.body.price).toFixed(2) || "No especificado"} $ ARS</li>
        </ul>
      </body>
    </html>
  `,
};
  // Enviar el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error al enviar el correo:", error);
      res.status(500).json({ success: false, error: "Error al enviar el correo" });
    } else {
      console.log("Correo enviado: " + info.response);
      res.status(200).json({ success: true, message: "Correo enviado correctamente" });
    }
  });
});

// Iniciar el servidor en un puerto específico
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Exporta el servidor de Express para que funcione como una serverless function en Vercel
export default app;


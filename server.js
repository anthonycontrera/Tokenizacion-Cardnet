const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// =========================================
// CONFIGURACIÓN
// =========================================

const PRIVATE_KEY =
  "573h-JheWH2bkL9bx59i8Lp-0YATxJdw4pfF3UorkpXaO3G3FDxsxr__";

const BASE_URL =
  "https://labservicios.cardnet.com.do/servicios/tokens/v1/api";

// HEADER CORRECTO
const authHeader = {
  Authorization: `Basic ${PRIVATE_KEY}`,
  "Content-Type": "application/json",
};

// =========================================
// 1. CREAR CUSTOMER
// =========================================

app.post("/create-customer", async (req, res) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/Customer`,
      {
        Email: req.body.email,
        Enable: true,
      },
      {
        headers: authHeader,
      }
    );

    console.log("CUSTOMER CREADO:");
    console.log(response.data);

    res.json(response.data);

  } catch (error) {

    console.log("ERROR CREATE CUSTOMER:");
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

// =========================================
// 2. OBTENER CUSTOMER
// =========================================

app.get("/customer/:id", async (req, res) => {

  try {

    const response = await axios.get(
      `${BASE_URL}/Customer/${req.params.id}`,
      {
        headers: authHeader,
      }
    );

    console.log("CUSTOMER:");
    console.log(JSON.stringify(response.data, null, 2));

    res.json(response.data);

  } catch (error) {

    console.log("ERROR GET CUSTOMER:");
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

// =========================================
// 3. ACTIVAR TOKEN
// =========================================

app.post("/activate-token", async (req, res) => {

  try {

    const {
      customerId,
      token,
      activationCode
    } = req.body;

    console.log("DATOS RECIBIDOS:");
    console.log({
      customerId,
      token,
      activationCode
    });

    // =====================================
    // ACTIVAR TOKEN
    // =====================================

    const activateResponse = await axios.post(

      `${BASE_URL}/Customer/${customerId}/activate`,

      {
        Token: token,
        ActivationCode: activationCode
      },

      {
        headers: authHeader
      }
    );

    console.log("RESPUESTA ACTIVACIÓN:");
    console.log(
      JSON.stringify(
        activateResponse.data,
        null,
        2
      )
    );

    // =====================================
    // CONSULTAR CUSTOMER
    // =====================================

    const customerResponse = await axios.get(

      `${BASE_URL}/Customer/${customerId}`,

      {
        headers: authHeader
      }
    );

    const customerData = customerResponse.data;

    console.log("CUSTOMER ACTUALIZADO:");
    console.log(
      JSON.stringify(
        customerData,
        null,
        2
      )
    );

    // =====================================
    // VALIDAR ENABLED
    // =====================================

    let tokenEnabled = false;

    const profiles =
      customerData.Response?.PaymentProfiles || [];

    console.log("PAYMENT PROFILES:");
    console.log(
      JSON.stringify(
        profiles,
        null,
        2
      )
    );

    const profile = profiles.find(
      x => x.Token === token
    );

    if (profile && profile.Enabled === true) {
      tokenEnabled = true;
    }

    // =====================================
    // RESPUESTA FINAL
    // =====================================

    res.json({

      success: tokenEnabled,

      enabled: tokenEnabled,

      message: tokenEnabled
        ? "Tarjeta activada correctamente"
        : "La tarjeta aún no está activa",

      profile: profile || null,

      activationResponse: activateResponse.data,

      customer: customerData
    });

  } catch (error) {

    console.log("ERROR ACTIVACIÓN:");

    if (error.response) {

      console.log(
        JSON.stringify(
          error.response.data,
          null,
          2
        )
      );

      return res.status(500).json({

        success: false,

        error: error.response.data
      });
    }

    console.log(error.message);

    res.status(500).json({

      success: false,

      error: error.message
    });
  }
});

// =========================================
// 4. REALIZAR COMPRA
// =========================================

app.post("/purchase", async (req, res) => {

  try {

    const response = await axios.post(

      `${BASE_URL}/Purchase`,

      {
        TrxToken: req.body.token,

        Order: `ORDER-${Date.now()}`,

        Amount: req.body.amount,

        Currency: "DOP",

        Capture: true,

        CustomerIP: "127.0.0.1",

        DataDo: {
          Tax: "0",
          Invoice: "000001",
        },
      },

      {
        headers: authHeader,
      }
    );

    console.log("COMPRA:");
    console.log(response.data);

    res.json(response.data);

  } catch (error) {

    console.log("ERROR PURCHASE:");
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

// =========================================
// INICIAR SERVIDOR
// =========================================

app.listen(3000, () => {

  console.log("=================================");
  console.log("SERVIDOR EJECUTÁNDOSE");
  console.log("http://localhost:3000");
  console.log("=================================");
});
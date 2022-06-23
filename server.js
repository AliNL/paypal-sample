const express = require('express');
const axios = require('axios');
require('dotenv/config');

const app = express();

let accessToken = '';

app.get('/paypalOptions', async (req, res) => {
  const { data: { access_token } } = await axios.post(
    'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    new URLSearchParams({
      'grant_type': 'client_credentials',
    }),
    {
      auth: {
        username: process.env.CLIENT_ID,
        password: process.env.CLIENT_SECRET,
      },
    },
  );
  accessToken = access_token;
  const { data: { client_token } } = await axios.post('https://api-m.sandbox.paypal.com/v1/identity/generate-token', undefined, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });
  res.send({
    'client-id': process.env.CLIENT_ID,
    'buyer-country': 'US',
    locale: 'en_US',
    currency: 'USD',
    intent: 'capture',
    'data-client-token': client_token,
    'merchant-id': 'test@whatever.email',
    components: 'buttons,hosted-fields,funding-eligibility',
  });
});

app.post('/paypalOrder', async (req, res) => {
  const { data: { id } } = await axios.post('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: '1.00',
      },
      payee: {
        email_address: 'test@whatever.email'
      },
    }],
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  })
  res.send({ id });
})

app.post('/paypalPayment/:id', async (req, res) => {
  const { id } = req.params;
  await axios.post(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${id}/capture`, undefined, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });
  res.send('OK');
})

app.listen(8080);

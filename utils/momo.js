// backend/utils/momo.js
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const momoConfig = {
  baseURL: 'https://sandbox.momodeveloper.mtn.com/collection/v1_0',
  subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY,
  apiUser: process.env.MTN_API_USER,
  apiKey: process.env.MTN_API_KEY,
};

async function getAccessToken() {
  const tokenRes = await axios.post(
    'https://sandbox.momodeveloper.mtn.com/collection/token/',
    {},
    {
      headers: {
        'Ocp-Apim-Subscription-Key': momoConfig.subscriptionKey,
        Authorization: `Basic ${Buffer.from(`${momoConfig.apiUser}:${momoConfig.apiKey}`).toString('base64')}`,
      },
    },
  );
  return tokenRes.data.access_token;
}

async function requestToPay(phone, amount, currency, externalId, payerMessage) {
  const accessToken = await getAccessToken();
  const referenceId = uuidv4();

  await axios.post(
    `${momoConfig.baseURL}/requesttopay`,
    {
      amount,
      currency,
      externalId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phone,
      },
      payerMessage,
      payeeNote: 'PaySSD Payment',
    },
    {
      headers: {
        'X-Reference-Id': referenceId,
        'X-Target-Environment': 'sandbox',
        'Ocp-Apim-Subscription-Key': momoConfig.subscriptionKey,
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return referenceId;
}

module.exports = { requestToPay };

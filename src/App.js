import React, { useEffect, useState } from "react";
import {
  PayPalButtons,
  PayPalHostedField,
  PayPalHostedFieldsProvider,
  PayPalScriptProvider, usePayPalHostedFields
} from "@paypal/react-paypal-js";
import axios from 'axios';

function SubmitCardPayment() {
  const { cardFields } = usePayPalHostedFields();

  const submitHandler = () => {
    cardFields?.submit().then((order) => axios.post(`/paypalPayment/${order.orderId}`));
  };

  return <button type="button" onClick={submitHandler}>Pay with Card</button>;
}

function App() {
  const [paypalOptions, setPaypalOptions] = useState(null);

  useEffect(() => {
    axios.get('/paypalOptions').then((response) => {
      setPaypalOptions(response.data);
    })
  }, [])

  const createOrder = async () => {
    const { data: { id } } = await axios.post('/paypalOrder');
    return id;
  };

  const capturePayment = async ({ orderID }) => {
    const result = await axios.post(`/paypalPayment/${orderID}`);
    // eslint-disable-next-line no-alert
    alert('Succeed!');
    return result;
  };

  return (
    <div>
      {paypalOptions && (
        <PayPalScriptProvider options={paypalOptions}>
          <PayPalButtons
            fundingSource="paypal"
            style={{ label: 'pay' }}
            createOrder={createOrder}
            onApprove={capturePayment}
          />
          <PayPalHostedFieldsProvider createOrder={createOrder} notEligibleError="Card payment not eligible">
            <PayPalHostedField
              id="paypalCardNumber"
              hostedFieldType="number"
              options={{ selector: '#paypalCardNumber' }}
            />
            <PayPalHostedField
              id="paypalCardCvv"
              hostedFieldType="cvv"
              options={{ selector: '#paypalCardCvv' }}
            />
            <PayPalHostedField
              id="paypalCardExpirationDate"
              hostedFieldType="expirationDate"
              options={{ selector: '#paypalCardExpirationDate' }}
            />
            <PayPalHostedField
              id="paypalCardPostalCode"
              hostedFieldType="postalCode"
              options={{ selector: '#paypalCardPostalCode' }}
            />
            <SubmitCardPayment />
          </PayPalHostedFieldsProvider>
        </PayPalScriptProvider>
      )}
    </div>
  );
}

export default App;

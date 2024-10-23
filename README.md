<h1 align="center">
   <b>
      <a href="https://ecconnect.upc.ua/">
        <img src="https://ecconnect.upc.ua/public/images/newLogo.svg" />
      </a>
    </b>
</h1>

<p align="center">upc-payment-js allows to initiate and process a payment in a separate browser tab or within an iframe directly on the website</p>

<p align="center">
  <a href="https://ecconnect.upc.ua/"><b>Website</b></a> •
  <a href="https://docs.ecconnect.upc.ua/"><b>Documentation</b></a>
</p> 

### Installing

```bash
$ npm install upc-payment-js
```
### Types and available payment parameters
https://github.com/upcecconnect/upc-payment-js/blob/main/dist/es/upc-payment-js.d.ts


### Demo-shop with examples of usage
https://upcecconnect.github.io/fake-shop

### Demo-shop (repo) with examples of usage
https://github.com/upcecconnect/fake-shop

### Example

Once the package is installed, you can import the library using `import` or `require` approach:

```js
import { UpcPayment } from 'upc-payment-js';

const payment = new UpcPayment({
  merchant: {
    id: '012345',
    terminalId: 'A012345',
    signature: 'Signature',
  },
  customer: {
    email: '',
    firstName: '',
    lastName: '',
    phoneCountryCode: '380',
    phoneNumber: '001234567',
  },
  iframeProps: {
    wrapperSelector: '#some-wrapper-id',
    callback: (data) => callbackHandler(data),
  },
});

payment.pay({
  currencyNumericCode: '980',
  description: 'description',
  orderId: 'orderId',
  // yymmddhhmmss
  purchaseTime: '241231235959',
  totalAmountCents: 12345,
});
```

### OR

Using link:

```html
<script src="https://raw.githubusercontent.com/upcecconnect/upc-payment-js/refs/heads/main/dist/iife/upc-payment-js.js"></script>
```
Or download and use lib directly

https://github.com/upcecconnect/upc-payment-js/blob/main/dist/iife/upc-payment-js.js

```js
if (window.UpcPayment) {
  const payment = new UpcPayment({
    // ...
  });
  payment.pay({
    //...
  });
}
```

### License

[MIT](LICENSE)

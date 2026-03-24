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

---

## Update in Version 2.0.0

- [x] З'явився новий параметр ініціалізації `paymentPageTarget` для вибору способу відкриття сторінки оплати якщо `mode = 'PaymentPage'`. Можливі значення `_self` або `_blank`. За замовчуванням використовується `_self`. Якщо буде вказано `_blank`, то сторінка оплати відкриється в новій вкладці (popup).
- [x] `mode` може мати значення `PaymentPage`, `PaymentIframe`, `PaymentModalIframe`. За замовчуванням використовується `PaymentPage`.

**В теці [`/example`](./example) додано загальний приклад для кожного з режимів.**

### Приклади коду

```js
if (window.UpcPayment) {
  const payment = new UpcPayment({
    mode: 'PaymentPage',
    paymentPageTarget: '_self',
    merchant: {
      id: request.merchantID,
      terminalId: request.terminalID,
      signature: request.signature,
    },
    customer: undefined,
    iframeProps: {
      wrapperSelector: iframeWrapperSelector,
      callback: (callbackData) => {
        switch (callbackData.event) {
          case 'success': {
            window.location.reload();
            break;
          }
          case 'go-back': {
            window.location.reload();
            break;
          }
        }
      },
    },
  });

  payment.pay({
    currencyNumericCode: request.currency.toString(),
    description: request.purchaseDesc,
    orderId: request.orderID,
    purchaseTime: request.purchaseTime,
    totalAmountCents: request.totalAmount,
    url: request.checkoutURL,
    locale: request.locale ?? Cookies.getCookie('lang') ?? 'uk-UA',
  });

  new Helpers().hideLoader();

  if (paymentDisplayMode == iframePaymentType)
    document.getElementById('upcPaymentEmbeddedModal').style.display = 'block';
}
```

### Приклад для `PaymentIframe`:

```js
const payment = new window.UpcPayment({
  mode: 'PaymentIframe',
  merchant: {
    id: request.merchantID,
    terminalId: request.terminalID,
    signature: request.signature,
  },
  iframeProps: {
    wrapperSelector: '#upcPaymentEmbeddedModal', // контейнер на сторінці
    callback: (callbackData) => {
      if (
        callbackData.event === 'success' ||
        callbackData.event === 'go-back'
      ) {
        window.location.reload();
      }
    },
  },
});

payment.pay({
  currencyNumericCode: request.currency.toString(),
  description: request.purchaseDesc,
  orderId: request.orderID,
  purchaseTime: request.purchaseTime,
  totalAmountCents: request.totalAmount,
  url: request.checkoutURL,
  locale: request.locale ?? Cookies.getCookie('lang') ?? 'uk-UA',
});
```

### Приклад для `PaymentModalIframe`:

```js
const payment = new window.UpcPayment({
  mode: 'PaymentModalIframe',
  merchant: {
    id: request.merchantID,
    terminalId: request.terminalID,
    signature: request.signature,
  },
  iframeProps: {
    callback: (callbackData) => {
      if (
        callbackData.event === 'success' ||
        callbackData.event === 'go-back'
      ) {
        window.location.reload();
      }
    },
  },
});
```

---

### License

[MIT](LICENSE)

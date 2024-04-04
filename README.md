<h1 align="center">
   <b>
        <a href="https://ecconnect.upc.ua/"><img src="https://ecconnect.upc.ua/public/images/newLogo.svg" /></a><br>
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

## Example

Once the package is installed, you can import the library using `import` or `require` approach:

```js
import { UpcPayment, UpcPaymentMode } from 'upc-payment-js';

const payment = new UpcPayment({
  commonProps: {
    merchantId: '012345',
    terminalId: 'A012345',
    signature: 'signature',
    currency: 980,
    paymentUrl: 'https://ecconnect.com.ua/',
    locale: 'en',
    mode: UpcPaymentMode.ModalIframe,
  },
  iframeProps: {
    onSuccessPayment: () => {},
    onFailurePayment: () => {},
    onGoBackToSiteButtonClick: () => {},
    onPayMoreButtonClick: () => {},
  },
});

payment.pay({
  orderId: 'orderId',
  description: 'description',
  purchaseTime: 1678436363678,
  totalAmount: 1000,
})

```

### OR

Using link:

```html
<script src="https://ecconnect.upc.ua/pub/utils/upc-payment-sdk/upc-payment-js.js"></script>
```


```js
if (window.UpcPayment) {
  const payment = new UpcPayment({
    commonProps: {
      merchantId: '012345',
      terminalId: 'A012345',
      signature: 'signature',
      currency: 980,
      paymentUrl: 'https://ecconnect.com.ua/',
      locale: 'en',
      mode: 'ModalIframe',
    },
    iframeProps: {
      onSuccessPayment: () => {},
      onFailurePayment: () => {},
      onGoBackToSiteButtonClick: () => {},
      onPayMoreButtonClick: () => {},
    },
  });

  payment.pay({
    orderId: 'orderId',
    description: 'description',
    purchaseTime: 1678436363678,
    totalAmount: 1000,
  })
}
```

## License

[MIT](LICENSE)

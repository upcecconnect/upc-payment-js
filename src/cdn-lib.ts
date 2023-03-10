import './scss/index.scss';

import { UpcPayment } from './npm-lib';

declare global {
  interface Window {
    UpcPayment: typeof UpcPayment;
  }
}

if (!window.UpcPayment) {
  window.UpcPayment = UpcPayment;
}

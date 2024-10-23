type MessageFromPaymentPage =
  'AppLoaded' |
  'Failure' |
  'GoBackToSite' |
  'Success' |
  'TryAgain'
;


interface EventMessageFromPaymentPage {
  readonly from: string;
  readonly message: MessageFromPaymentPage;
  readonly height: number;
  readonly width: number;
}

export interface PaymentIframeCallbackData {
  readonly event: 'loaded'|'failure'|'success'|'go-back'|'try-again';
  readonly data: {
    readonly height: number;
    readonly width: number;
  };
}
type CallbackFunction = (callbackData: PaymentIframeCallbackData) => void;

interface IframeProps {
  readonly wrapperSelector?: string|undefined;
  readonly callback?: CallbackFunction;
}

interface MerchantData {
  readonly id: string;
  readonly terminalId: string;
  readonly signature: string;
}

interface PaymentData {
  readonly altCurrencyNumericCode?: string|undefined;
  readonly altFeeCents?: number|undefined;
  readonly altTotalAmountCents?: number|undefined;
  readonly currencyNumericCode: string;
  readonly delay?: number|undefined;
  readonly description: string;
  readonly feeCents?: number|undefined;
  readonly locale?: string|undefined;
  readonly orderId: string;
  readonly purchaseTime: string;
  readonly token?: string|undefined;
  readonly totalAmountCents: number;
  readonly url?: string|undefined;
}

interface CustomerData {
  readonly email?: string|undefined;
  readonly phoneCountryCode?: string|undefined;
  readonly phoneNumber?: string|undefined;
  readonly firstName?: string|undefined;
  readonly lastName?: string|undefined;
}

interface IUpcPaymentProps {
  readonly mode?: 'PaymentIframe'|'PaymentModalIframe'|'PaymentPage'|undefined;
  readonly merchant: MerchantData;
  readonly customer?: CustomerData|undefined;
  readonly iframeProps?: IframeProps|undefined;
}

interface IUpcPayment extends IUpcPaymentProps {
  pay: (data: PaymentData) => void;
}

export class UpcPayment implements IUpcPayment {
  public readonly mode;
  public readonly merchant;
  public readonly customer;
  public readonly iframeProps;

  public constructor(props: IUpcPaymentProps) {
    const availableModes: IUpcPaymentProps['mode'][] = ['PaymentIframe', 'PaymentModalIframe', 'PaymentPage'];
    if (props.mode && availableModes.includes(props.mode)) {
      this.mode = props.mode;
    } else {
      this.mode = 'PaymentPage' as const;
    }
    this.validateMerchantData(props.merchant);
    this.merchant = props.merchant;
    this.validateCustomerData(props.customer);
    this.customer = props.customer;
    this.validateIframeProps(props.iframeProps);
    this.iframeProps = props.iframeProps;
  }

  public pay(data: PaymentData): void {
    const form = this.getPaymentForm(data);
    this.validatePaymentData(data);
    if (this.mode === 'PaymentPage') {
      document.body.appendChild(form);
      form.submit();
      return;
    }

    const iframeWrapper = document.querySelector(this.iframeProps?.wrapperSelector || 'body');
    if (!iframeWrapper) {
      throw new Error('Iframe wrapper element not found');
    }
    const existingWrapper = document.querySelector('.upc-payment-iframe-wrapper');
    if (existingWrapper) {
      existingWrapper.remove();
    }
    const existingIframe = document.querySelector('#upc-payment-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    this.setMessageListener();
    iframe.setAttribute('frameborder', '0');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.minHeight = '500px';
    iframe.id = 'upc-payment-iframe';

    if (this.mode === 'PaymentIframe') {
      iframeWrapper.appendChild(iframe);
    } else {
      const iframeWrapperInternal = this.getIframeWrapper();
      iframeWrapperInternal.querySelector('button')?.addEventListener('click', () => {
        iframeWrapperInternal.remove();
      });
      iframeWrapperInternal.querySelector('main')?.appendChild(iframe);
      document.body.appendChild(iframeWrapperInternal);
    }
    iframe.contentWindow?.document.body.appendChild(form);
    form.submit();
  }

  private validateMerchantData(data: MerchantData): void {
    if (typeof data.id !== 'string' || !data.id) {
      throw new Error('Field "merchant.id" is required');
    }
    if (typeof data.terminalId !== 'string' || !data.terminalId) {
      throw new Error('Field "merchant.terminalId" is required');
    }
    if (typeof data.signature !== 'string' || !data.signature) {
      throw new Error('Field "merchant.signature" is required');
    }
  }

  private validateCustomerData(data: CustomerData|undefined): void {
    if (!data) {
      return;
    }
    if (data.email && typeof data.email !== 'string') {
      throw new Error('Field "customer.email" is invalid');
    }
    if (data.phoneCountryCode && typeof data.phoneCountryCode !== 'string') {
      throw new Error('Field "customer.phoneCountryCode" is invalid');
    }
    if (data.phoneNumber && typeof data.phoneNumber !== 'string') {
      throw new Error('Field "customer.phoneNumber" is invalid');
    }
    if (data.firstName && typeof data.firstName !== 'string') {
      throw new Error('Field "customer.firstName" is invalid');
    }
    if (data.lastName && typeof data.lastName !== 'string') {
      throw new Error('Field "customer.lastName" is invalid');
    }
  }

  private validateIframeProps(props: IframeProps|undefined): void {
    if (!props) {
      return;
    }
    if (props.wrapperSelector) {
      if (typeof props.wrapperSelector !== 'string') {
        throw new Error('Field "iframeProps.wrapperSelector" is invalid');
      }
      const element = document.querySelector(props.wrapperSelector);
      if (!element) {
        throw new Error('Wrapper element not found');
      }
    }
    if (props.callback && typeof props.callback !== 'function') {
      throw new Error('Field "iframeProps.callback" is invalid');
    }
  }

  private validatePaymentData(data: PaymentData): void {
    if (data.altTotalAmountCents) {
      if (typeof data.altTotalAmountCents !== 'number') {
        throw new Error('Field "payment.altTotalAmountCents" is invalid');
      }
      if (Number.isNaN(data.altTotalAmountCents)) {
        throw new Error('Field "payment.altTotalAmountCents" is invalid');
      }
    }
    if (data.altCurrencyNumericCode && typeof data.altCurrencyNumericCode !== 'string') {
      throw new Error('Field "payment.altCurrencyNumericCode" is invalid');
    }
    if (data.altFeeCents && typeof data.altFeeCents !== 'number') {
      throw new Error('Field "payment.altFeeCents" is invalid');
    }
    if (typeof data.currencyNumericCode !== 'string' || !data.currencyNumericCode) {
      throw new Error('Field "payment.currencyNumericCode" is invalid');
    }
    if (data.delay) {
      if (typeof data.delay !== 'number') {
        throw new Error('Field "payment.delay" is invalid');
      }
      if (Number.isNaN(data.delay)) {
        throw new Error('Field "payment.delay" is invalid');
      }
    }
    if (typeof data.description !== 'string' || !data.description) {
      throw new Error('Field "payment.description" is invalid');
    }
    if (data.feeCents && typeof data.feeCents !== 'number') {
      throw new Error('Field "payment.feeCents" is invalid');
    }
    if (data.locale && typeof data.locale !== 'string') {
      throw new Error('Field "payment.locale" is invalid');
    }
    if (typeof data.orderId !== 'string' || !data.orderId) {
      throw new Error('Field "payment.orderId" is invalid');
    }
    if (!data.purchaseTime) {
      throw new Error('Field "payment.purchaseTime" is invalid');
    }
    if (data.token && typeof data.token !== 'string') {
      throw new Error('Field "payment.token" is invalid');
    }
    if (typeof data.totalAmountCents !== 'number' || !data.totalAmountCents) {
      throw new Error('Payment totalAmountCents is invalid');
    }
    if (data.url && typeof data.url !== 'string') {
      throw new Error('Payment locale is invalid');
    }
  }

  private getInputEl(name: string, value: string): HTMLInputElement {
    const input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', name);
    input.setAttribute('value', value);
    return input;
  }

  private getPaymentForm(data: PaymentData): HTMLFormElement {
    const url = data.url || 'https://ecg.test.upc.ua/go/pay';
    const form = document.createElement('form');
    form.setAttribute('action', url);
    form.setAttribute('method', 'POST');
    form.style.visibility = 'hidden';
    if (this.mode === 'PaymentPage') {
      form.setAttribute('target', '_blank');
    }
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Type');
    meta.setAttribute('content', 'text/html; charset=utf-8');
    form.appendChild(meta);

    form.appendChild(this.getInputEl('MerchantID', this.merchant.id));
    form.appendChild(this.getInputEl('TerminalID', this.merchant.terminalId));
    form.appendChild(this.getInputEl('Signature', this.merchant.signature));

    if (data.altTotalAmountCents) {
      form.appendChild(this.getInputEl('AltTotalAmount', data.altTotalAmountCents.toString()));
    }
    if (data.altCurrencyNumericCode) {
      form.appendChild(this.getInputEl('AltCurrency', data.altCurrencyNumericCode));
    }
    if (data.altFeeCents) {
      form.appendChild(this.getInputEl('AltFee', data.altFeeCents.toString()));
    }
    form.appendChild(this.getInputEl('Currency', data.currencyNumericCode));
    if (data.delay) {
      form.appendChild(this.getInputEl('delay', data.delay.toString()));
    }
    form.appendChild(this.getInputEl('PurchaseDesc', data.description));
    if (data.feeCents) {
      form.appendChild(this.getInputEl('Fee', data.feeCents.toString()));
    }
    if (data.locale) {
      form.appendChild(this.getInputEl('locale', data.locale));
    }
    form.appendChild(this.getInputEl('OrderID', data.orderId));
    form.appendChild(this.getInputEl('PurchaseTime', String(data.purchaseTime)));
    if (data.token) {
      form.appendChild(this.getInputEl('UPCToken', data.token));
    }
    form.appendChild(this.getInputEl('TotalAmount', data.totalAmountCents.toString()));
    if (this.customer?.email) {
      form.appendChild(this.getInputEl('email', this.customer.email));
    }
    if (this.customer?.phoneCountryCode) {
      form.appendChild(this.getInputEl('phoneCountryCode', this.customer.phoneCountryCode));
    }
    if (this.customer?.phoneNumber) {
      form.appendChild(this.getInputEl('phoneNumber', this.customer.phoneNumber));
    }
    if (this.customer?.firstName) {
      form.appendChild(this.getInputEl('consumerFirstName', this.customer.firstName));
    }
    if (this.customer?.lastName) {
      form.appendChild(this.getInputEl('consumerLastName', this.customer.lastName));
    }
    return form;
  }

  private setMessageListener(): void {
    const processEvent = (event: MessageEvent<EventMessageFromPaymentPage>): void => {
      const from = event.data.from;
      if (from !== 'UpcPaymentIframe') {
        return;
      }
      let callback: CallbackFunction = () => {
        // do nothing
      };
      if (typeof this.iframeProps?.callback === 'function') {
        callback = this.iframeProps.callback;
      }
      const message = event.data.message;
      switch (message) {
        case 'AppLoaded':
          callback({
            event: 'loaded',
            data: {
              height: event.data.height,
              width: event.data.width,
            },
          });
          break;
        case 'Failure':
          callback({
            event: 'failure',
            data: {
              height: event.data.height,
              width: event.data.width,
            },
          });
          break;
        case 'Success':
          callback({
            event: 'success',
            data: {
              height: event.data.height,
              width: event.data.width,
            },
          });
          break;
        case 'GoBackToSite':
          callback({
            event: 'go-back',
            data: {
              height: event.data.height,
              width: event.data.width,
            },
          });
          break;
        case 'TryAgain':
          callback({
            event: 'try-again',
            data: {
              height: event.data.height,
              width: event.data.width,
            },
          });
          break;
        default:
          // eslint-disable-next-line
          console.error(`Unknown message from iframe ${message}`);
          break;
      }
    };
    window.removeEventListener('message', processEvent);
    window.addEventListener('message', processEvent);
  }

  private getIframeWrapper(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('upc-payment-iframe-wrapper');
    container.style.cssText = `
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;

    `;
    container.innerHTML = `
      <main
        style="
          background-color: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          position: relative;
          width: 80%;
          max-width: 500px;
        "
      >
        <button
          style="
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            background-color: transparent;
            border: none;
            cursor: pointer;
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#312F2F"
          >
            <path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
          </svg>
        </button>
      </main>
    `;
    return container;
  }
}

declare global {
  interface Window {
    UpcPayment: typeof UpcPayment;
  }
}

if (import.meta.env.MODE === 'iife') {
  if (!window.UpcPayment) {
    window.UpcPayment = UpcPayment;
  }
}

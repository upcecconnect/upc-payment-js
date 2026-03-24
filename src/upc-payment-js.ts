type MessageFromPaymentPage =
  | 'AppLoaded'
  | 'Failure'
  | 'GoBackToSite'
  | 'Success'
  | 'TryAgain';

interface EventMessageFromPaymentPage {
  readonly from: string;
  readonly message: MessageFromPaymentPage;
  readonly height: number;
  readonly width: number;
}

export interface PaymentIframeCallbackData {
  readonly event: 'loaded' | 'failure' | 'success' | 'go-back' | 'try-again';
  readonly data: {
    readonly height: number;
    readonly width: number;
  };
}
type CallbackFunction = (callbackData: PaymentIframeCallbackData) => void;

interface IframeProps {
  readonly wrapperSelector?: string | undefined;
  readonly callback?: CallbackFunction;
}

interface MerchantData {
  readonly id: string;
  readonly terminalId: string;
  readonly signature: string;
}

interface PaymentData {
  readonly altCurrencyNumericCode?: string | undefined;
  readonly altFeeCents?: number | undefined;
  readonly altTotalAmountCents?: number | undefined;
  readonly currencyNumericCode: string;
  readonly delay?: number | undefined;
  readonly description: string;
  readonly feeCents?: number | undefined;
  readonly locale?: string | undefined;
  readonly orderId: string;
  readonly purchaseTime: string;
  readonly token?: string | undefined;
  readonly totalAmountCents: number;
  readonly url?: string | undefined;
}

interface CustomerData {
  readonly email?: string | undefined;
  readonly phoneCountryCode?: string | undefined;
  readonly phoneNumber?: string | undefined;
  readonly firstName?: string | undefined;
  readonly lastName?: string | undefined;
}

interface IUpcPaymentProps {
  readonly mode?:
    | 'PaymentIframe'
    | 'PaymentModalIframe'
    | 'PaymentPage'
    | undefined;
  readonly merchant: MerchantData;
  readonly customer?: CustomerData | undefined;
  readonly iframeProps?: IframeProps | undefined;
  readonly paymentPageTarget?: '_self' | '_blank' | undefined;
}

interface IUpcPayment extends IUpcPaymentProps {
  pay: (data: PaymentData) => void;
}

export class UpcPayment implements IUpcPayment {
  // Fix 1: Keep a stable message handler reference on the class instance so
  // removeEventListener can actually detach previously attached listeners.
  // Without this, every pay() call creates a new function identity and old
  // listeners continue to live, causing duplicated callbacks over time.
  private readonly processEvent = (
    event: MessageEvent<EventMessageFromPaymentPage>,
  ): void => {
    // Fix 2: Validate message shape early to avoid runtime access errors when
    // unrelated postMessage payloads (non-object data) are received.
    if (!event.data || typeof event.data !== 'object') {
      return;
    }

    const from = event.data.from;
    if (from !== 'UpcPaymentIframe') {
      return;
    }

    // Fix 3: Accept postMessage only from expected origin, derived from the
    // payment URL for the current pay() call. This prevents other origins from
    // spoofing iframe events by sending crafted payloads into the parent page.
    if (
      !this.expectedIframeOrigin ||
      event.origin !== this.expectedIframeOrigin
    ) {
      return;
    }

    // Fix 4: Validate sender window identity to ensure events come from the
    // active payment iframe and not from another window/tab/frame at same origin.
    if (event.source !== this.activeIframeWindow) {
      return;
    }

    let callback: CallbackFunction = () => {
      // do nothing
    };
    if (typeof this.iframeProps?.callback === 'function') {
      callback = this.iframeProps.callback;
    }

    const messageToEvent: Record<
      MessageFromPaymentPage,
      PaymentIframeCallbackData['event']
    > = {
      AppLoaded: 'loaded',
      Failure: 'failure',
      Success: 'success',
      GoBackToSite: 'go-back',
      TryAgain: 'try-again',
    };

    const callbackEvent = messageToEvent[event.data.message];
    if (!callbackEvent) {
      // eslint-disable-next-line
      console.error(`Unknown message from iframe ${event.data.message}`);
      return;
    }

    callback({
      event: callbackEvent,
      data: {
        height: event.data.height,
        width: event.data.width,
      },
    });
  };

  // Fix 5: Track the currently active iframe window and expected origin used
  // by security checks in processEvent.
  private activeIframeWindow: Window | null = null;
  private expectedIframeOrigin: string | null = null;

  public readonly mode;
  public readonly merchant;
  public readonly customer;
  public readonly iframeProps;
  public readonly paymentPageTarget;

  public constructor(props: IUpcPaymentProps) {
    const availableModes: IUpcPaymentProps['mode'][] = [
      'PaymentIframe',
      'PaymentModalIframe',
      'PaymentPage',
    ];
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
    const availableTargets: IUpcPaymentProps['paymentPageTarget'][] = [
      '_self',
      '_blank',
    ];
    if (
      props.paymentPageTarget &&
      availableTargets.includes(props.paymentPageTarget)
    ) {
      this.paymentPageTarget = props.paymentPageTarget;
    } else {
      this.paymentPageTarget = '_self' as const;
    }
  }

  public pay(data: PaymentData): void {
    // Fix 6: Run validation before any DOM/form creation so invalid input fails
    // fast and we avoid creating side effects from malformed payment data.
    this.validatePaymentData(data);
    const form = this.getPaymentForm(data);
    if (this.mode === 'PaymentPage') {
      document.body.appendChild(form);
      form.submit();
      return;
    }

    const iframeWrapper = document.querySelector(
      this.iframeProps?.wrapperSelector || 'body',
    );
    if (!iframeWrapper) {
      throw new Error('Iframe wrapper element not found');
    }
    const existingWrapper = document.querySelector(
      '.upc-payment-iframe-wrapper',
    );
    if (existingWrapper) {
      existingWrapper.remove();
    }
    const existingIframe = document.querySelector('#upc-payment-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    // Fix 7: Reset active iframe tracking before creating a new one.
    this.activeIframeWindow = null;

    const iframe = document.createElement('iframe');
    // Fix 8: Resolve expected origin from form action URL and set listener
    // before submit to safely process lifecycle messages from payment page.
    this.expectedIframeOrigin = new URL(form.action).origin;
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
      iframeWrapperInternal
        .querySelector('button')
        ?.addEventListener('click', () => {
          // Fix 9: Clear active iframe reference when modal is manually closed.
          this.activeIframeWindow = null;
          iframeWrapperInternal.remove();
        });
      iframeWrapperInternal.querySelector('main')?.appendChild(iframe);
      document.body.appendChild(iframeWrapperInternal);
    }
    // Fix 10: Capture the concrete iframe window reference used for source check.
    this.activeIframeWindow = iframe.contentWindow;
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

  private validateCustomerData(data: CustomerData | undefined): void {
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

  private validateIframeProps(props: IframeProps | undefined): void {
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
    // Fix 11: Use explicit undefined checks for optional numeric fields so
    // legitimate zero values are validated instead of being silently skipped.
    if (data.altTotalAmountCents !== undefined) {
      if (typeof data.altTotalAmountCents !== 'number') {
        throw new Error('Field "payment.altTotalAmountCents" is invalid');
      }
      if (Number.isNaN(data.altTotalAmountCents)) {
        throw new Error('Field "payment.altTotalAmountCents" is invalid');
      }
    }
    if (
      data.altCurrencyNumericCode &&
      typeof data.altCurrencyNumericCode !== 'string'
    ) {
      throw new Error('Field "payment.altCurrencyNumericCode" is invalid');
    }
    if (data.altFeeCents !== undefined) {
      if (typeof data.altFeeCents !== 'number') {
        throw new Error('Field "payment.altFeeCents" is invalid');
      }
      if (Number.isNaN(data.altFeeCents)) {
        throw new Error('Field "payment.altFeeCents" is invalid');
      }
    }
    if (
      typeof data.currencyNumericCode !== 'string' ||
      !data.currencyNumericCode
    ) {
      throw new Error('Field "payment.currencyNumericCode" is invalid');
    }
    if (data.delay !== undefined) {
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
    if (data.feeCents !== undefined) {
      if (typeof data.feeCents !== 'number') {
        throw new Error('Field "payment.feeCents" is invalid');
      }
      if (Number.isNaN(data.feeCents)) {
        throw new Error('Field "payment.feeCents" is invalid');
      }
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
      // Fix 12: Return precise field name in error message to speed up debugging.
      throw new Error('Field "payment.url" is invalid');
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
      form.setAttribute('target', this.paymentPageTarget);
    }
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Type');
    meta.setAttribute('content', 'text/html; charset=utf-8');
    form.appendChild(meta);

    form.appendChild(this.getInputEl('MerchantID', this.merchant.id));
    form.appendChild(this.getInputEl('TerminalID', this.merchant.terminalId));
    form.appendChild(this.getInputEl('Signature', this.merchant.signature));

    // Fix 13: Use explicit undefined checks when building form fields so zero
    // values are not dropped from outgoing payment payload.
    if (data.altTotalAmountCents !== undefined) {
      form.appendChild(
        this.getInputEl('AltTotalAmount', data.altTotalAmountCents.toString()),
      );
    }
    if (data.altCurrencyNumericCode) {
      form.appendChild(
        this.getInputEl('AltCurrency', data.altCurrencyNumericCode),
      );
    }
    if (data.altFeeCents !== undefined) {
      form.appendChild(this.getInputEl('AltFee', data.altFeeCents.toString()));
    }
    form.appendChild(this.getInputEl('Currency', data.currencyNumericCode));
    if (data.delay !== undefined) {
      form.appendChild(this.getInputEl('delay', data.delay.toString()));
    }
    form.appendChild(this.getInputEl('PurchaseDesc', data.description));
    if (data.feeCents !== undefined) {
      form.appendChild(this.getInputEl('Fee', data.feeCents.toString()));
    }
    if (data.locale) {
      form.appendChild(this.getInputEl('locale', data.locale));
    }
    form.appendChild(this.getInputEl('OrderID', data.orderId));
    form.appendChild(
      this.getInputEl('PurchaseTime', String(data.purchaseTime)),
    );
    if (data.token) {
      form.appendChild(this.getInputEl('UPCToken', data.token));
    }
    form.appendChild(
      this.getInputEl('TotalAmount', data.totalAmountCents.toString()),
    );
    if (this.customer?.email) {
      form.appendChild(this.getInputEl('email', this.customer.email));
    }
    if (this.customer?.phoneCountryCode) {
      form.appendChild(
        this.getInputEl('phoneCountryCode', this.customer.phoneCountryCode),
      );
    }
    if (this.customer?.phoneNumber) {
      form.appendChild(
        this.getInputEl('phoneNumber', this.customer.phoneNumber),
      );
    }
    if (this.customer?.firstName) {
      form.appendChild(
        this.getInputEl('consumerFirstName', this.customer.firstName),
      );
    }
    if (this.customer?.lastName) {
      form.appendChild(
        this.getInputEl('consumerLastName', this.customer.lastName),
      );
    }
    return form;
  }

  private setMessageListener(): void {
    // Fix 14: Rebind using the same class-level handler reference to guarantee
    // idempotent listener registration across repeated pay() calls.
    window.removeEventListener('message', this.processEvent);
    window.addEventListener('message', this.processEvent);
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

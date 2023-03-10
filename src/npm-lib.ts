import './scss/index.scss';

enum MessageFromUpcPaymentIframe {
  AppLoaded = 'AppLoaded',
  Failure = 'Failure',
  GoBackToSite = 'GoBackToSite',
  PayMore = 'PayMore',
  Success = 'Success',
}

export enum UpcPaymentMode {
  BuiltInIframe = 'BuiltInIframe',
  ModalIframe = 'ModalIframe',
  PaymentPage = 'PaymentPage',
}

interface EventMessageFromUpcPaymentIframe {
  readonly from: string;
  readonly message: MessageFromUpcPaymentIframe;
}

interface CommonProps {
  readonly currency: number;
  readonly locale?: string|undefined;
  readonly merchantId: string;
  readonly mode: UpcPaymentMode;
  readonly paymentUrl?: string|undefined;
  readonly signature: string;
  readonly terminalId: string;
}

interface IframeProps {
  readonly wrapperSelector?: string|undefined;
  readonly onFailurePayment?: () => void;
  readonly onGoBackToSiteButtonClick?: () => void;
  readonly onIframeLoaded?: () => void;
  readonly onPayMoreButtonClick?: () => void;
  readonly onSuccessPayment?: () => void;
}

interface PaymentData {
  readonly orderId: string;
  readonly description: string;
  readonly purchaseTime: number;
  readonly totalAmount: number;
}

interface UpcPaymentIframeProps {
  readonly commonProps: CommonProps;
  readonly iframeProps?: IframeProps|undefined;
}

interface UpcPaymentIframe extends UpcPaymentIframeProps {
  pay: (data: PaymentData) => void;
}

export class UpcPayment implements UpcPaymentIframe {
  public readonly commonProps;
  public readonly iframeProps;

  private readonly containerClass: string;
  private readonly modalBackgroundClass: string;
  private readonly modalWindowClass: string;
  private readonly buttonCloseClass: string;
  private readonly iframeWrapperClass: string;
  private readonly iframeClass: string;
  private readonly spinnerClass: string;
  private readonly classVisible: string;
  private readonly classInvisible: string;
  private readonly transitionDuration: number;

  public constructor(props: UpcPaymentIframeProps) {
    this.commonProps = props.commonProps;
    this.iframeProps = props.iframeProps;
    this.containerClass = this.commonProps.mode === UpcPaymentMode.BuiltInIframe ? 'upc-payment' : 'upc-payment-modal';
    this.modalBackgroundClass = `${this.containerClass}__modal-background`;
    this.modalWindowClass = `${this.containerClass}__modal-window`;
    this.buttonCloseClass = `${this.containerClass}__btn-close`;
    this.iframeWrapperClass = `${this.containerClass}__iframe-wrapper`;
    this.iframeClass = `${this.containerClass}__iframe`;
    this.spinnerClass = `${this.containerClass}__spinner`;
    this.classVisible = 'visible';
    this.classInvisible = 'invisible';
    this.transitionDuration = 300;
    if (this.commonProps.mode !== UpcPaymentMode.PaymentPage) {
      this.setMessageListenerFromIframe();
    }
  }

  public pay(paymentData: PaymentData): void {
    if (this.commonProps.mode === UpcPaymentMode.PaymentPage) {
      const form = this.getPaymentForm(paymentData);
      document.body.append(form);
      form.submit();
      return;
    }
    const iframeWrapper = this.getIframeWrapper();
    const iframe = document.createElement('iframe');
    iframe.classList.add(this.iframeClass);
    iframe.setAttribute('frameborder', '0');
    iframeWrapper.appendChild(iframe);
    const form = this.getPaymentForm(paymentData);
    iframe.contentWindow?.document.body.appendChild(form);
    form.submit();
  }

  private getPaymentForm(paymentData: PaymentData): HTMLFormElement {
    const url = this.commonProps.paymentUrl ?? 'https://ecg.test.upc.ua/go/pay';
    const form = document.createElement('form');
    form.setAttribute('action', url);
    form.setAttribute('method', 'POST');
    form.setAttribute('id', 'upc-payment-form');
    if (this.commonProps.mode === UpcPaymentMode.PaymentPage) {
      form.setAttribute('target', '_blank');
    }
    form.style.visibility = 'hidden';
    const formInnerHtml = `
      <meta http-equiv="Content-Type"content="text/html; charset=utf-8">
      <input name="MerchantID" type="hidden"value="${this.commonProps.merchantId}"/>
      <input name="TerminalID" type="hidden"value="${this.commonProps.terminalId}"/>
      <input name="locale" type="hidden"value="${this.commonProps.locale ?? 'en'}"/>
      <input name="Signature" type="hidden"value="${this.commonProps.signature}"/>
      <input name="Currency" type="hidden"value="${this.commonProps.currency}"/>
      <input name="TotalAmount" type="hidden"value="${paymentData.totalAmount}"/>
      <input name="PurchaseTime" type="hidden"value="${paymentData.purchaseTime}"/>
      <input name="OrderID" type="hidden"value="${paymentData.orderId}"/>
      <input name="PurchaseDesc" type="hidden"value="${paymentData.description}"/>
      <input type="submit" style="visibility: hidden" />
    `;
    form.innerHTML = formInnerHtml;
    return form;
  }

  private getIframeWrapper(): HTMLDivElement {
    const container = document.createElement('div');
    container.classList.add(this.containerClass);
    if (this.commonProps.mode === UpcPaymentMode.ModalIframe) {
      container.innerHTML = `
      <div class=${this.modalBackgroundClass}>
        <div class="${this.modalWindowClass}">
          <div class="${this.buttonCloseClass}">×</div>
          <div class="${this.iframeWrapperClass}"></div>
          <div class="${this.spinnerClass}">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    `;
      this.setCloseOnClickHandler(container);
    } else {
      container.innerHTML = `
        <div class="${this.iframeWrapperClass}"></div>
        <div class="${this.spinnerClass}">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
    `;
    }
    const parentElement = document.querySelector(this.iframeProps?.wrapperSelector ?? 'body');
    if (!parentElement) {
      throw new Error('Parent element for iframe not found!');
    }
    parentElement.appendChild(container);
    if (this.commonProps.mode === UpcPaymentMode.ModalIframe) {
      setTimeout(() => {
        container.classList.add(this.classVisible);
      }, this.transitionDuration);
    }
    const contentElement = container.querySelector(`.${this.iframeWrapperClass}`);
    if (!contentElement) {
      throw new Error('Modal window content div not found!');
    }
    return contentElement as HTMLDivElement;
  }

  private setCloseOnClickHandler(mainElement: HTMLDivElement): void {
    mainElement.addEventListener('click', (event) => {
      const target = event.target as HTMLElement|null;
      if (!target) {
        return;
      }
      const shouldClose = target.classList.contains(this.modalBackgroundClass) ||
        target.classList.contains(this.buttonCloseClass)
      ;
      if (shouldClose) {
        mainElement.classList.remove(this.classVisible);
        setTimeout(() => {
          mainElement.parentNode?.removeChild(mainElement);
        }, this.transitionDuration);
      }
    });
  }

  private setMessageListenerFromIframe(): void {
    window.addEventListener('message', (event: MessageEvent<EventMessageFromUpcPaymentIframe>) => {
      const from = event.data.from;
      if (from !== 'UpcPaymentIframe') {
        return;
      }
      const message = event.data.message;
      if (message === MessageFromUpcPaymentIframe.AppLoaded) {
        if (typeof this.iframeProps?.onIframeLoaded === 'function') {
          this.iframeProps.onIframeLoaded();
        }
        document.querySelector(`.${this.spinnerClass}`)?.classList.add(this.classInvisible);
        return;
      }
      if (message === MessageFromUpcPaymentIframe.Failure) {
        if (typeof this.iframeProps?.onFailurePayment === 'function') {
          this.iframeProps.onFailurePayment();
        }
        return;
      }
      if (message === MessageFromUpcPaymentIframe.GoBackToSite) {
        if (typeof this.iframeProps?.onGoBackToSiteButtonClick === 'function') {
          this.iframeProps.onGoBackToSiteButtonClick();
        }
        return;
      }
      if (message === MessageFromUpcPaymentIframe.PayMore) {
        if (typeof this.iframeProps?.onPayMoreButtonClick === 'function') {
          this.iframeProps.onPayMoreButtonClick();
        }
        return;
      }
      if (message === MessageFromUpcPaymentIframe.Success) {
        if (typeof this.iframeProps?.onSuccessPayment === 'function') {
          this.iframeProps.onSuccessPayment();
        }
        return;
      }
      console.error(`Unknown message from iframe ${message}`);
    });
  }
}

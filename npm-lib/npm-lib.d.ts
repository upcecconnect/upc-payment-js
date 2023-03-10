import './scss/index.scss';
export declare enum UpcPaymentMode {
    BuiltInIframe = "BuiltInIframe",
    ModalIframe = "ModalIframe",
    PaymentPage = "PaymentPage"
}
interface CommonProps {
    readonly currency: number;
    readonly locale?: string | undefined;
    readonly merchantId: string;
    readonly mode: UpcPaymentMode;
    readonly paymentUrl?: string | undefined;
    readonly signature: string;
    readonly terminalId: string;
}
interface IframeProps {
    readonly wrapperSelector?: string | undefined;
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
    readonly iframeProps?: IframeProps | undefined;
}
interface UpcPaymentIframe extends UpcPaymentIframeProps {
    pay: (data: PaymentData) => void;
}
export declare class UpcPayment implements UpcPaymentIframe {
    readonly commonProps: CommonProps;
    readonly iframeProps: IframeProps | undefined;
    private readonly containerClass;
    private readonly modalBackgroundClass;
    private readonly modalWindowClass;
    private readonly buttonCloseClass;
    private readonly iframeWrapperClass;
    private readonly iframeClass;
    private readonly spinnerClass;
    private readonly classVisible;
    private readonly classInvisible;
    private readonly transitionDuration;
    constructor(props: UpcPaymentIframeProps);
    pay(paymentData: PaymentData): void;
    private getPaymentForm;
    private getIframeWrapper;
    private setCloseOnClickHandler;
    private setMessageListenerFromIframe;
}
export {};

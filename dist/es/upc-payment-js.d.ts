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
    readonly purchaseTime: number;
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
    readonly mode?: 'PaymentIframe' | 'PaymentModalIframe' | 'PaymentPage' | undefined;
    readonly merchant: MerchantData;
    readonly customer?: CustomerData | undefined;
    readonly iframeProps?: IframeProps | undefined;
}
interface IUpcPayment extends IUpcPaymentProps {
    pay: (data: PaymentData) => void;
}
export declare class UpcPayment implements IUpcPayment {
    readonly mode: "PaymentIframe" | "PaymentModalIframe" | "PaymentPage";
    readonly merchant: MerchantData;
    readonly customer: CustomerData | undefined;
    readonly iframeProps: IframeProps | undefined;
    constructor(props: IUpcPaymentProps);
    pay(data: PaymentData): void;
    private validateMerchantData;
    private validateCustomerData;
    private validateIframeProps;
    private validatePaymentData;
    private getInputEl;
    private getPaymentForm;
    private setMessageListener;
    private getIframeWrapper;
}
declare global {
    interface Window {
        UpcPayment: typeof UpcPayment;
    }
}
export {};

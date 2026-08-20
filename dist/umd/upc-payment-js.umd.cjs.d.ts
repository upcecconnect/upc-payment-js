export interface PaymentIframeCallbackData {
    readonly event: 'loaded' | 'failure' | 'success' | 'go-back' | 'try-again';
    readonly data: {
        readonly height: number;
        readonly width: number;
    };
}
type CallbackFunction = (callbackData: PaymentIframeCallbackData) => void;
export interface PaymentLinkRecipient {
    readonly firstName: string;
    readonly lastName: string;
    readonly middleName?: string | undefined;
}
export interface CreatePaymentLinkData {
    readonly currencyCode: string;
    readonly recipientCardNumber: string;
    readonly uuid: string;
    readonly recipient: PaymentLinkRecipient;
    readonly expirationDate: number;
    readonly orderId?: string | undefined;
    readonly amount?: string | undefined;
    readonly description?: string | undefined;
    readonly fee?: string | null | undefined;
    readonly operationType?: string | undefined;
    readonly multipay?: boolean | undefined;
    readonly expirationDateUnit?: string | undefined;
    readonly invoiceLinkViewType?: string | undefined;
    readonly locale?: string | undefined;
    readonly orderDate?: string | undefined;
    readonly url?: string | undefined;
}
export interface PaymentLinkResult {
    readonly url: string;
    readonly id: string;
    readonly creationDate: string;
}
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
    readonly mode?: 'PaymentIframe' | 'PaymentModalIframe' | 'PaymentPage' | undefined;
    readonly merchant: MerchantData;
    readonly customer?: CustomerData | undefined;
    readonly iframeProps?: IframeProps | undefined;
}
interface IUpcPayment extends IUpcPaymentProps {
    pay: (data: PaymentData) => void;
    createPaymentLink: (data: CreatePaymentLinkData) => Promise<PaymentLinkResult>;
}
export declare class UpcPayment implements IUpcPayment {
    readonly mode: "PaymentIframe" | "PaymentModalIframe" | "PaymentPage";
    readonly merchant: MerchantData;
    readonly customer: CustomerData | undefined;
    readonly iframeProps: IframeProps | undefined;
    constructor(props: IUpcPaymentProps);
    pay(data: PaymentData): void;
    createPaymentLink(data: CreatePaymentLinkData): Promise<PaymentLinkResult>;
    private base64Encode;
    private validateMerchantData;
    private validateCustomerData;
    private validateIframeProps;
    private validatePaymentData;
    private validateCreatePaymentLinkData;
    private buildPaymentLinkPayload;
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

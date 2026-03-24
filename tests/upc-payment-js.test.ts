import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UpcPayment } from '../src/upc-payment-js';

const baseMerchant = {
  id: 'merchant-id',
  terminalId: 'terminal-id',
  signature: 'signature',
};

const basePaymentData = {
  currencyNumericCode: '980',
  description: 'Order payment',
  orderId: 'ORDER-1',
  purchaseTime: '2026-03-24T10:00:00Z',
  totalAmountCents: 100,
};

const getInternal = (payment: UpcPayment) => {
  return payment as unknown as {
    expectedIframeOrigin: string | null;
    activeIframeWindow: Window | null;
    processEvent: (event: MessageEvent) => void;
    setMessageListener: () => void;
  };
};

describe('UpcPayment', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();

    // Prevent real form submission side-effects in jsdom tests.
    vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {
      return;
    });
  });

  it('includes optional numeric fields when their value is 0', () => {
    const payment = new UpcPayment({
      mode: 'PaymentPage',
      merchant: baseMerchant,
    });

    payment.pay({
      ...basePaymentData,
      altTotalAmountCents: 0,
      altFeeCents: 0,
      delay: 0,
      feeCents: 0,
    });

    const submittedForm = document.querySelector('form');
    expect(submittedForm).not.toBeNull();

    const getValue = (name: string): string | null => {
      return (
        submittedForm
          ?.querySelector(`input[name="${name}"]`)
          ?.getAttribute('value') ?? null
      );
    };

    expect(getValue('AltTotalAmount')).toBe('0');
    expect(getValue('AltFee')).toBe('0');
    expect(getValue('delay')).toBe('0');
    expect(getValue('Fee')).toBe('0');
  });

  it('uses PaymentPage mode and _self target by default', () => {
    const payment = new UpcPayment({
      merchant: baseMerchant,
    });

    payment.pay(basePaymentData);

    const submittedForm = document.querySelector('form');
    expect(submittedForm?.getAttribute('target')).toBe('_self');
  });

  it('uses provided paymentPageTarget when set to _blank', () => {
    const payment = new UpcPayment({
      mode: 'PaymentPage',
      merchant: baseMerchant,
      paymentPageTarget: '_blank',
    });

    payment.pay(basePaymentData);

    const submittedForm = document.querySelector('form');
    expect(submittedForm?.getAttribute('target')).toBe('_blank');
  });

  it('falls back to safe defaults when invalid mode and target are provided', () => {
    const payment = new UpcPayment({
      mode: 'InvalidMode' as unknown as 'PaymentPage',
      merchant: baseMerchant,
      paymentPageTarget: 'new-window' as unknown as '_self',
    });

    payment.pay(basePaymentData);

    const submittedForm = document.querySelector('form');
    expect(submittedForm?.getAttribute('target')).toBe('_self');
  });

  it('appends optional customer fields to form payload', () => {
    const payment = new UpcPayment({
      mode: 'PaymentPage',
      merchant: baseMerchant,
      customer: {
        email: 'john@example.com',
        phoneCountryCode: '380',
        phoneNumber: '501112233',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    payment.pay(basePaymentData);

    const submittedForm = document.querySelector('form');
    expect(
      submittedForm
        ?.querySelector('input[name="email"]')
        ?.getAttribute('value'),
    ).toBe('john@example.com');
    expect(
      submittedForm
        ?.querySelector('input[name="phoneCountryCode"]')
        ?.getAttribute('value'),
    ).toBe('380');
    expect(
      submittedForm
        ?.querySelector('input[name="phoneNumber"]')
        ?.getAttribute('value'),
    ).toBe('501112233');
    expect(
      submittedForm
        ?.querySelector('input[name="consumerFirstName"]')
        ?.getAttribute('value'),
    ).toBe('John');
    expect(
      submittedForm
        ?.querySelector('input[name="consumerLastName"]')
        ?.getAttribute('value'),
    ).toBe('Doe');
  });

  it('fails before form is appended when payment data is invalid', () => {
    const payment = new UpcPayment({
      mode: 'PaymentPage',
      merchant: baseMerchant,
    });

    expect(() => {
      payment.pay({
        ...basePaymentData,
        totalAmountCents: 0,
      });
    }).toThrowError('Payment totalAmountCents is invalid');

    expect(document.querySelector('form')).toBeNull();
  });

  it('throws on invalid merchant data in constructor', () => {
    expect(() => {
      new UpcPayment({
        merchant: {
          ...baseMerchant,
          id: '',
        },
      });
    }).toThrowError('Field "merchant.id" is required');
  });

  it('throws when iframe wrapperSelector is not found', () => {
    expect(() => {
      new UpcPayment({
        mode: 'PaymentIframe',
        merchant: baseMerchant,
        iframeProps: {
          wrapperSelector: '#missing-wrapper',
        },
      });
    }).toThrowError('Wrapper element not found');
  });

  it('throws when iframe callback is not a function', () => {
    expect(() => {
      new UpcPayment({
        mode: 'PaymentIframe',
        merchant: baseMerchant,
        iframeProps: {
          callback: 'invalid' as unknown as () => void,
        },
      });
    }).toThrowError('Field "iframeProps.callback" is invalid');
  });

  it('throws when payment.url is not a string', () => {
    const payment = new UpcPayment({
      mode: 'PaymentPage',
      merchant: baseMerchant,
    });

    expect(() => {
      payment.pay({
        ...basePaymentData,
        url: 100 as unknown as string,
      });
    }).toThrowError('Field "payment.url" is invalid');
  });

  it('appends iframe to provided wrapper when mode is PaymentIframe', () => {
    const host = document.createElement('div');
    host.id = 'iframe-host';
    document.body.appendChild(host);

    const payment = new UpcPayment({
      mode: 'PaymentIframe',
      merchant: baseMerchant,
      iframeProps: {
        wrapperSelector: '#iframe-host',
      },
    });

    payment.pay(basePaymentData);

    expect(host.querySelector('#upc-payment-iframe')).not.toBeNull();
  });

  it('creates modal wrapper and removes it on close click in PaymentModalIframe mode', () => {
    const payment = new UpcPayment({
      mode: 'PaymentModalIframe',
      merchant: baseMerchant,
    });
    const internal = getInternal(payment);

    payment.pay(basePaymentData);

    const modalWrapper = document.querySelector('.upc-payment-iframe-wrapper');
    expect(modalWrapper).not.toBeNull();
    expect(internal.activeIframeWindow).not.toBeNull();

    const closeButton = modalWrapper?.querySelector('button');
    closeButton?.dispatchEvent(new MouseEvent('click'));

    expect(document.querySelector('.upc-payment-iframe-wrapper')).toBeNull();
    expect(internal.activeIframeWindow).toBeNull();
  });

  it('ignores iframe message when origin does not match expected origin', () => {
    const callback = vi.fn();
    const payment = new UpcPayment({
      mode: 'PaymentIframe',
      merchant: baseMerchant,
      iframeProps: { callback },
    });

    const activeSource = {} as Window;
    const asInternal = getInternal(payment);

    asInternal.expectedIframeOrigin = 'https://ecg.test.upc.ua';
    asInternal.activeIframeWindow = activeSource;

    asInternal.processEvent({
      data: {
        from: 'UpcPaymentIframe',
        message: 'AppLoaded',
        height: 500,
        width: 400,
      },
      origin: 'https://malicious.example',
      source: activeSource,
    } as unknown as MessageEvent);

    expect(callback).not.toHaveBeenCalled();
  });

  it('processes iframe message only when origin and source match', () => {
    const callback = vi.fn();
    const payment = new UpcPayment({
      mode: 'PaymentIframe',
      merchant: baseMerchant,
      iframeProps: { callback },
    });

    const activeSource = {} as Window;
    const asInternal = getInternal(payment);

    asInternal.expectedIframeOrigin = 'https://ecg.test.upc.ua';
    asInternal.activeIframeWindow = activeSource;

    asInternal.processEvent({
      data: {
        from: 'UpcPaymentIframe',
        message: 'Success',
        height: 600,
        width: 450,
      },
      origin: 'https://ecg.test.upc.ua',
      source: activeSource,
    } as unknown as MessageEvent);

    asInternal.processEvent({
      data: {
        from: 'UpcPaymentIframe',
        message: 'Success',
        height: 600,
        width: 450,
      },
      origin: 'https://ecg.test.upc.ua',
      source: {} as Window,
    } as unknown as MessageEvent);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      event: 'success',
      data: {
        height: 600,
        width: 450,
      },
    });
  });

  it('ignores message when payload is not an object', () => {
    const callback = vi.fn();
    const payment = new UpcPayment({
      mode: 'PaymentIframe',
      merchant: baseMerchant,
      iframeProps: { callback },
    });
    const asInternal = getInternal(payment);

    asInternal.expectedIframeOrigin = 'https://ecg.test.upc.ua';
    asInternal.activeIframeWindow = {} as Window;

    asInternal.processEvent({
      data: 'bad-payload',
      origin: 'https://ecg.test.upc.ua',
      source: asInternal.activeIframeWindow,
    } as unknown as MessageEvent);

    expect(callback).not.toHaveBeenCalled();
  });

  it('ignores message when sender marker is not UpcPaymentIframe', () => {
    const callback = vi.fn();
    const payment = new UpcPayment({
      mode: 'PaymentIframe',
      merchant: baseMerchant,
      iframeProps: { callback },
    });
    const asInternal = getInternal(payment);

    asInternal.expectedIframeOrigin = 'https://ecg.test.upc.ua';
    asInternal.activeIframeWindow = {} as Window;

    asInternal.processEvent({
      data: {
        from: 'AnotherIframe',
        message: 'Success',
        height: 1,
        width: 1,
      },
      origin: 'https://ecg.test.upc.ua',
      source: asInternal.activeIframeWindow,
    } as unknown as MessageEvent);

    expect(callback).not.toHaveBeenCalled();
  });

  it('maps all known iframe message types to callback events', () => {
    const callback = vi.fn();
    const payment = new UpcPayment({
      mode: 'PaymentIframe',
      merchant: baseMerchant,
      iframeProps: { callback },
    });
    const asInternal = getInternal(payment);
    const activeSource = {} as Window;

    asInternal.expectedIframeOrigin = 'https://ecg.test.upc.ua';
    asInternal.activeIframeWindow = activeSource;

    const events = [
      { message: 'AppLoaded', mappedEvent: 'loaded' },
      { message: 'Failure', mappedEvent: 'failure' },
      { message: 'GoBackToSite', mappedEvent: 'go-back' },
      { message: 'TryAgain', mappedEvent: 'try-again' },
    ] as const;

    for (const eventCase of events) {
      asInternal.processEvent({
        data: {
          from: 'UpcPaymentIframe',
          message: eventCase.message,
          height: 777,
          width: 333,
        },
        origin: 'https://ecg.test.upc.ua',
        source: activeSource,
      } as unknown as MessageEvent);
    }

    expect(callback).toHaveBeenCalledTimes(events.length);
    expect(callback).toHaveBeenNthCalledWith(1, {
      event: 'loaded',
      data: { height: 777, width: 333 },
    });
    expect(callback).toHaveBeenNthCalledWith(2, {
      event: 'failure',
      data: { height: 777, width: 333 },
    });
    expect(callback).toHaveBeenNthCalledWith(3, {
      event: 'go-back',
      data: { height: 777, width: 333 },
    });
    expect(callback).toHaveBeenNthCalledWith(4, {
      event: 'try-again',
      data: { height: 777, width: 333 },
    });
  });

  it('rebinds message listener using a stable handler reference', () => {
    const payment = new UpcPayment({
      mode: 'PaymentIframe',
      merchant: baseMerchant,
    });

    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const addSpy = vi.spyOn(window, 'addEventListener');

    const asInternal = getInternal(payment);

    asInternal.setMessageListener();
    asInternal.setMessageListener();

    const firstRemovedHandler = removeSpy.mock.calls[0][1];
    const firstAddedHandler = addSpy.mock.calls[0][1];

    expect(firstRemovedHandler).toBe(asInternal.processEvent);
    expect(firstAddedHandler).toBe(asInternal.processEvent);
    expect(removeSpy.mock.calls[1][1]).toBe(firstRemovedHandler);
    expect(addSpy.mock.calls[1][1]).toBe(firstAddedHandler);
  });
});

class d {
  constructor(e) {
    const r = ["PaymentIframe", "PaymentModalIframe", "PaymentPage"];
    e.mode && r.includes(e.mode) ? this.mode = e.mode : this.mode = "PaymentPage", this.validateMerchantData(e.merchant), this.merchant = e.merchant, this.validateCustomerData(e.customer), this.customer = e.customer, this.validateIframeProps(e.iframeProps), this.iframeProps = e.iframeProps;
  }
  pay(e) {
    var s, a, l, h;
    const r = this.getPaymentForm(e);
    if (this.validatePaymentData(e), this.mode === "PaymentPage") {
      document.body.appendChild(r), r.submit();
      return;
    }
    const t = document.querySelector(((s = this.iframeProps) == null ? void 0 : s.wrapperSelector) || "body");
    if (!t)
      throw new Error("Iframe wrapper element not found");
    const n = document.querySelector(".upc-payment-iframe-wrapper");
    n && n.remove();
    const o = document.querySelector("#upc-payment-iframe");
    o && o.remove();
    const i = document.createElement("iframe");
    if (this.setMessageListener(), i.setAttribute("frameborder", "0"), i.style.width = "100%", i.style.height = "100%", i.style.minHeight = "500px", i.id = "upc-payment-iframe", this.mode === "PaymentIframe")
      t.appendChild(i);
    else {
      const m = this.getIframeWrapper();
      (a = m.querySelector("button")) == null || a.addEventListener("click", () => {
        m.remove();
      }), (l = m.querySelector("main")) == null || l.appendChild(i), document.body.appendChild(m);
    }
    (h = i.contentWindow) == null || h.document.body.appendChild(r), r.submit();
  }
  validateMerchantData(e) {
    if (typeof e.id != "string" || !e.id)
      throw new Error('Field "merchant.id" is required');
    if (typeof e.terminalId != "string" || !e.terminalId)
      throw new Error('Field "merchant.terminalId" is required');
    if (typeof e.signature != "string" || !e.signature)
      throw new Error('Field "merchant.signature" is required');
  }
  validateCustomerData(e) {
    if (e) {
      if (e.email && typeof e.email != "string")
        throw new Error('Field "customer.email" is invalid');
      if (e.phoneCountryCode && typeof e.phoneCountryCode != "string")
        throw new Error('Field "customer.phoneCountryCode" is invalid');
      if (e.phoneNumber && typeof e.phoneNumber != "string")
        throw new Error('Field "customer.phoneNumber" is invalid');
      if (e.firstName && typeof e.firstName != "string")
        throw new Error('Field "customer.firstName" is invalid');
      if (e.lastName && typeof e.lastName != "string")
        throw new Error('Field "customer.lastName" is invalid');
    }
  }
  validateIframeProps(e) {
    if (e) {
      if (e.wrapperSelector) {
        if (typeof e.wrapperSelector != "string")
          throw new Error('Field "iframeProps.wrapperSelector" is invalid');
        if (!document.querySelector(e.wrapperSelector))
          throw new Error("Wrapper element not found");
      }
      if (e.callback && typeof e.callback != "function")
        throw new Error('Field "iframeProps.callback" is invalid');
    }
  }
  validatePaymentData(e) {
    if (e.altTotalAmountCents) {
      if (typeof e.altTotalAmountCents != "number")
        throw new Error('Field "payment.altTotalAmountCents" is invalid');
      if (Number.isNaN(e.altTotalAmountCents))
        throw new Error('Field "payment.altTotalAmountCents" is invalid');
    }
    if (e.altCurrencyNumericCode && typeof e.altCurrencyNumericCode != "string")
      throw new Error('Field "payment.altCurrencyNumericCode" is invalid');
    if (e.altFeeCents && typeof e.altFeeCents != "number")
      throw new Error('Field "payment.altFeeCents" is invalid');
    if (typeof e.currencyNumericCode != "string" || !e.currencyNumericCode)
      throw new Error('Field "payment.currencyNumericCode" is invalid');
    if (e.delay) {
      if (typeof e.delay != "number")
        throw new Error('Field "payment.delay" is invalid');
      if (Number.isNaN(e.delay))
        throw new Error('Field "payment.delay" is invalid');
    }
    if (typeof e.description != "string" || !e.description)
      throw new Error('Field "payment.description" is invalid');
    if (e.feeCents && typeof e.feeCents != "number")
      throw new Error('Field "payment.feeCents" is invalid');
    if (e.locale && typeof e.locale != "string")
      throw new Error('Field "payment.locale" is invalid');
    if (typeof e.orderId != "string" || !e.orderId)
      throw new Error('Field "payment.orderId" is invalid');
    if (typeof e.purchaseTime != "number" || !e.purchaseTime)
      throw new Error('Field "payment.purchaseTime" is invalid');
    if (e.token && typeof e.token != "string")
      throw new Error('Field "payment.token" is invalid');
    if (typeof e.totalAmountCents != "number" || !e.totalAmountCents)
      throw new Error("Payment totalAmountCents is invalid");
    if (e.url && typeof e.url != "string")
      throw new Error("Payment locale is invalid");
  }
  getInputEl(e, r) {
    const t = document.createElement("input");
    return t.setAttribute("type", "hidden"), t.setAttribute("name", e), t.setAttribute("value", r), t;
  }
  getPaymentForm(e) {
    var o, i, s, a, l;
    const r = e.url || "https://ecg.test.upc.ua/go/pay", t = document.createElement("form");
    t.setAttribute("action", r), t.setAttribute("method", "POST"), t.style.visibility = "hidden", this.mode === "PaymentPage" && t.setAttribute("target", "_blank");
    const n = document.createElement("meta");
    return n.setAttribute("http-equiv", "Content-Type"), n.setAttribute("content", "text/html; charset=utf-8"), t.appendChild(n), t.appendChild(this.getInputEl("MerchantID", this.merchant.id)), t.appendChild(this.getInputEl("TerminalID", this.merchant.terminalId)), t.appendChild(this.getInputEl("Signature", this.merchant.signature)), e.altTotalAmountCents && t.appendChild(this.getInputEl("AltTotalAmount", e.altTotalAmountCents.toString())), e.altCurrencyNumericCode && t.appendChild(this.getInputEl("AltCurrency", e.altCurrencyNumericCode)), e.altFeeCents && t.appendChild(this.getInputEl("AltFee", e.altFeeCents.toString())), t.appendChild(this.getInputEl("Currency", e.currencyNumericCode)), e.delay && t.appendChild(this.getInputEl("delay", e.delay.toString())), t.appendChild(this.getInputEl("PurchaseDesc", e.description)), e.feeCents && t.appendChild(this.getInputEl("Fee", e.feeCents.toString())), e.locale && t.appendChild(this.getInputEl("locale", e.locale)), t.appendChild(this.getInputEl("OrderID", e.orderId)), e.purchaseTime && t.appendChild(this.getInputEl("PurchaseTime", e.purchaseTime.toString())), e.token && t.appendChild(this.getInputEl("UPCToken", e.token)), t.appendChild(this.getInputEl("TotalAmount", e.totalAmountCents.toString())), (o = this.customer) != null && o.email && t.appendChild(this.getInputEl("email", this.customer.email)), (i = this.customer) != null && i.phoneCountryCode && t.appendChild(this.getInputEl("phoneCountryCode", this.customer.phoneCountryCode)), (s = this.customer) != null && s.phoneNumber && t.appendChild(this.getInputEl("phoneNumber", this.customer.phoneNumber)), (a = this.customer) != null && a.firstName && t.appendChild(this.getInputEl("consumerFirstName", this.customer.firstName)), (l = this.customer) != null && l.lastName && t.appendChild(this.getInputEl("consumerLastName", this.customer.lastName)), t;
  }
  setMessageListener() {
    const e = (r) => {
      var i;
      if (r.data.from !== "UpcPaymentIframe")
        return;
      let n = () => {
      };
      typeof ((i = this.iframeProps) == null ? void 0 : i.callback) == "function" && (n = this.iframeProps.callback);
      const o = r.data.message;
      switch (o) {
        case "AppLoaded":
          n({
            event: "loaded",
            data: {
              height: r.data.height,
              width: r.data.width
            }
          });
          break;
        case "Failure":
          n({
            event: "failure",
            data: {
              height: r.data.height,
              width: r.data.width
            }
          });
          break;
        case "Success":
          n({
            event: "success",
            data: {
              height: r.data.height,
              width: r.data.width
            }
          });
          break;
        case "GoBackToSite":
          n({
            event: "go-back",
            data: {
              height: r.data.height,
              width: r.data.width
            }
          });
          break;
        case "TryAgain":
          n({
            event: "try-again",
            data: {
              height: r.data.height,
              width: r.data.width
            }
          });
          break;
        default:
          console.error(`Unknown message from iframe ${o}`);
          break;
      }
    };
    window.removeEventListener("message", e), window.addEventListener("message", e);
  }
  getIframeWrapper() {
    const e = document.createElement("div");
    return e.classList.add("upc-payment-iframe-wrapper"), e.style.cssText = `
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

    `, e.innerHTML = `
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
    `, e;
  }
}
export {
  d as UpcPayment
};
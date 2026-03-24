//#region src/upc-payment-js.ts
var e = class {
	constructor(e) {
		this.processEvent = (e) => {
			if (!e.data || typeof e.data != "object" || e.data.from !== "UpcPaymentIframe" || !this.expectedIframeOrigin || e.origin !== this.expectedIframeOrigin || e.source !== this.activeIframeWindow) return;
			let t = () => {};
			typeof this.iframeProps?.callback == "function" && (t = this.iframeProps.callback);
			let n = {
				AppLoaded: "loaded",
				Failure: "failure",
				Success: "success",
				GoBackToSite: "go-back",
				TryAgain: "try-again"
			}[e.data.message];
			if (!n) {
				console.error(`Unknown message from iframe ${e.data.message}`);
				return;
			}
			t({
				event: n,
				data: {
					height: e.data.height,
					width: e.data.width
				}
			});
		}, this.activeIframeWindow = null, this.expectedIframeOrigin = null, e.mode && [
			"PaymentIframe",
			"PaymentModalIframe",
			"PaymentPage"
		].includes(e.mode) ? this.mode = e.mode : this.mode = "PaymentPage", this.validateMerchantData(e.merchant), this.merchant = e.merchant, this.validateCustomerData(e.customer), this.customer = e.customer, this.validateIframeProps(e.iframeProps), this.iframeProps = e.iframeProps, e.paymentPageTarget && ["_self", "_blank"].includes(e.paymentPageTarget) ? this.paymentPageTarget = e.paymentPageTarget : this.paymentPageTarget = "_self";
	}
	pay(e) {
		this.validatePaymentData(e);
		let t = this.getPaymentForm(e);
		if (this.mode === "PaymentPage") {
			document.body.appendChild(t), t.submit();
			return;
		}
		let n = document.querySelector(this.iframeProps?.wrapperSelector || "body");
		if (!n) throw Error("Iframe wrapper element not found");
		let r = document.querySelector(".upc-payment-iframe-wrapper");
		r && r.remove();
		let i = document.querySelector("#upc-payment-iframe");
		i && i.remove(), this.activeIframeWindow = null;
		let a = document.createElement("iframe");
		if (this.expectedIframeOrigin = new URL(t.action).origin, this.setMessageListener(), a.setAttribute("frameborder", "0"), a.style.width = "100%", a.style.height = "100%", a.style.minHeight = "500px", a.id = "upc-payment-iframe", this.mode === "PaymentIframe") n.appendChild(a);
		else {
			let e = this.getIframeWrapper();
			e.querySelector("button")?.addEventListener("click", () => {
				this.activeIframeWindow = null, e.remove();
			}), e.querySelector("main")?.appendChild(a), document.body.appendChild(e);
		}
		this.activeIframeWindow = a.contentWindow, a.contentWindow?.document.body.appendChild(t), t.submit();
	}
	validateMerchantData(e) {
		if (typeof e.id != "string" || !e.id) throw Error("Field \"merchant.id\" is required");
		if (typeof e.terminalId != "string" || !e.terminalId) throw Error("Field \"merchant.terminalId\" is required");
		if (typeof e.signature != "string" || !e.signature) throw Error("Field \"merchant.signature\" is required");
	}
	validateCustomerData(e) {
		if (e) {
			if (e.email && typeof e.email != "string") throw Error("Field \"customer.email\" is invalid");
			if (e.phoneCountryCode && typeof e.phoneCountryCode != "string") throw Error("Field \"customer.phoneCountryCode\" is invalid");
			if (e.phoneNumber && typeof e.phoneNumber != "string") throw Error("Field \"customer.phoneNumber\" is invalid");
			if (e.firstName && typeof e.firstName != "string") throw Error("Field \"customer.firstName\" is invalid");
			if (e.lastName && typeof e.lastName != "string") throw Error("Field \"customer.lastName\" is invalid");
		}
	}
	validateIframeProps(e) {
		if (e) {
			if (e.wrapperSelector) {
				if (typeof e.wrapperSelector != "string") throw Error("Field \"iframeProps.wrapperSelector\" is invalid");
				if (!document.querySelector(e.wrapperSelector)) throw Error("Wrapper element not found");
			}
			if (e.callback && typeof e.callback != "function") throw Error("Field \"iframeProps.callback\" is invalid");
		}
	}
	validatePaymentData(e) {
		if (e.altTotalAmountCents !== void 0 && (typeof e.altTotalAmountCents != "number" || Number.isNaN(e.altTotalAmountCents))) throw Error("Field \"payment.altTotalAmountCents\" is invalid");
		if (e.altCurrencyNumericCode && typeof e.altCurrencyNumericCode != "string") throw Error("Field \"payment.altCurrencyNumericCode\" is invalid");
		if (e.altFeeCents !== void 0 && (typeof e.altFeeCents != "number" || Number.isNaN(e.altFeeCents))) throw Error("Field \"payment.altFeeCents\" is invalid");
		if (typeof e.currencyNumericCode != "string" || !e.currencyNumericCode) throw Error("Field \"payment.currencyNumericCode\" is invalid");
		if (e.delay !== void 0 && (typeof e.delay != "number" || Number.isNaN(e.delay))) throw Error("Field \"payment.delay\" is invalid");
		if (typeof e.description != "string" || !e.description) throw Error("Field \"payment.description\" is invalid");
		if (e.feeCents !== void 0 && (typeof e.feeCents != "number" || Number.isNaN(e.feeCents))) throw Error("Field \"payment.feeCents\" is invalid");
		if (e.locale && typeof e.locale != "string") throw Error("Field \"payment.locale\" is invalid");
		if (typeof e.orderId != "string" || !e.orderId) throw Error("Field \"payment.orderId\" is invalid");
		if (!e.purchaseTime) throw Error("Field \"payment.purchaseTime\" is invalid");
		if (e.token && typeof e.token != "string") throw Error("Field \"payment.token\" is invalid");
		if (typeof e.totalAmountCents != "number" || !e.totalAmountCents) throw Error("Payment totalAmountCents is invalid");
		if (e.url && typeof e.url != "string") throw Error("Field \"payment.url\" is invalid");
	}
	getInputEl(e, t) {
		let n = document.createElement("input");
		return n.setAttribute("type", "hidden"), n.setAttribute("name", e), n.setAttribute("value", t), n;
	}
	getPaymentForm(e) {
		let t = e.url || "https://ecg.test.upc.ua/go/pay", n = document.createElement("form");
		n.setAttribute("action", t), n.setAttribute("method", "POST"), n.style.visibility = "hidden", this.mode === "PaymentPage" && n.setAttribute("target", this.paymentPageTarget);
		let r = document.createElement("meta");
		return r.setAttribute("http-equiv", "Content-Type"), r.setAttribute("content", "text/html; charset=utf-8"), n.appendChild(r), n.appendChild(this.getInputEl("MerchantID", this.merchant.id)), n.appendChild(this.getInputEl("TerminalID", this.merchant.terminalId)), n.appendChild(this.getInputEl("Signature", this.merchant.signature)), e.altTotalAmountCents !== void 0 && n.appendChild(this.getInputEl("AltTotalAmount", e.altTotalAmountCents.toString())), e.altCurrencyNumericCode && n.appendChild(this.getInputEl("AltCurrency", e.altCurrencyNumericCode)), e.altFeeCents !== void 0 && n.appendChild(this.getInputEl("AltFee", e.altFeeCents.toString())), n.appendChild(this.getInputEl("Currency", e.currencyNumericCode)), e.delay !== void 0 && n.appendChild(this.getInputEl("delay", e.delay.toString())), n.appendChild(this.getInputEl("PurchaseDesc", e.description)), e.feeCents !== void 0 && n.appendChild(this.getInputEl("Fee", e.feeCents.toString())), e.locale && n.appendChild(this.getInputEl("locale", e.locale)), n.appendChild(this.getInputEl("OrderID", e.orderId)), n.appendChild(this.getInputEl("PurchaseTime", String(e.purchaseTime))), e.token && n.appendChild(this.getInputEl("UPCToken", e.token)), n.appendChild(this.getInputEl("TotalAmount", e.totalAmountCents.toString())), this.customer?.email && n.appendChild(this.getInputEl("email", this.customer.email)), this.customer?.phoneCountryCode && n.appendChild(this.getInputEl("phoneCountryCode", this.customer.phoneCountryCode)), this.customer?.phoneNumber && n.appendChild(this.getInputEl("phoneNumber", this.customer.phoneNumber)), this.customer?.firstName && n.appendChild(this.getInputEl("consumerFirstName", this.customer.firstName)), this.customer?.lastName && n.appendChild(this.getInputEl("consumerLastName", this.customer.lastName)), n;
	}
	setMessageListener() {
		window.removeEventListener("message", this.processEvent), window.addEventListener("message", this.processEvent);
	}
	getIframeWrapper() {
		let e = document.createElement("div");
		return e.classList.add("upc-payment-iframe-wrapper"), e.style.cssText = "\n      position: fixed;\n      left: 0;\n      right: 0;\n      top: 0;\n      bottom: 0;\n      background-color: rgba(0, 0, 0, 0.5);\n      z-index: 9999;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n\n    ", e.innerHTML = "\n      <main\n        style=\"\n          background-color: #fff;\n          padding: 20px;\n          border-radius: 10px;\n          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);\n          position: relative;\n          width: 80%;\n          max-width: 500px;\n        \"\n      >\n        <button\n          style=\"\n            position: absolute;\n            top: 10px;\n            right: 10px;\n            width: 30px;\n            height: 30px;\n            background-color: transparent;\n            border: none;\n            cursor: pointer;\n          \"\n        >\n          <svg\n            xmlns=\"http://www.w3.org/2000/svg\"\n            viewBox=\"0 0 24 24\"\n            fill=\"#312F2F\"\n          >\n            <path d=\"M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z\" />\n          </svg>\n        </button>\n      </main>\n    ", e;
	}
};
//#endregion
export { e as UpcPayment };

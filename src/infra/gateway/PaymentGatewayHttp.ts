import PaymentGateway, { PayInput } from "../../application/gateway/PaymentGateway";

import HttpClient from "../http/HttpClient";

export default class PaymentGatewayHttp implements PaymentGateway {
    constructor (readonly httpClient: HttpClient) {
    }

    async pay(input: PayInput): Promise<any> {
        return this.httpClient.post(`${process.env.API_PAYMENT_GATEWAY}/payments`, input);
    }
}





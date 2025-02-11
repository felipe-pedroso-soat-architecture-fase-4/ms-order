export type PayInput = {
    order_id: string;
    payment_method: string;
};
export default interface PaymentGateway {
    pay(input: PayInput): Promise<any>;
}
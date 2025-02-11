import ClientGateway from "../gateway/ClientGateway";
import Order from "../../domain/entity/Order";
import { OrderRepository } from "../../infra/repository/OrderRepository";
import { ProductRepository } from "../../infra/repository/ProductRepository";

export default class GetOrder {
    constructor(readonly orderRepository: OrderRepository, readonly productRepository: ProductRepository, readonly clientGateway: ClientGateway ) {}

    async execute({ order_id }: Input): Promise<Output | undefined> {
        const order = await this.orderRepository.getOrderById(order_id);
        if (!order?.order_id) {
            throw new Error("Order not found");
        }
        const orderRestored = Order.restore(order.order_id, order.products, order.getStatus(), order.created_at, order.client_id);

        const products = await Promise.all(orderRestored.products.map(async product => {
            const productData = await this.productRepository.getProductById(product.product_id);
            return {
                product_id: product.product_id,
                quantity: product.quantity,
                name: productData!.name,
                description: productData!.description,
                price: product.price,
                category: productData!.category
            };
        }));

        let client;
        if (orderRestored.client_id) {
            client = await this.clientGateway.getClientById(orderRestored.client_id);
        }

        return {
            order_id: orderRestored.order_id,
            total_price: orderRestored.calculateTotalPrice(),
            status: orderRestored.getStatus(),
            client_name: client?.name,
            products,
            created_at: orderRestored.created_at
        };
    }
}

type Input = {
    order_id: string;
};

type Output = {
    order_id: string;
    total_price: number;
    products: {
        product_id: string,
        quantity: number;
        name: string,
        description: string,
        price: number,
        category: string
    }[];
    status: string;
    client_name: string | undefined;
    created_at: string;
};
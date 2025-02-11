import { Knex } from "knex";
import Order from "../../domain/entity/Order";
import OrderProduct from "../../domain/vo/OrderProduct";
import QueryBuilderDatabaseConnection from "../database/QueryBuilderDatabaseConnection";
import { create } from "ts-node";

type OrderItem = {
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    order_item_id: string
}

// [Driven/Resource] Port
export interface OrderRepository {
    getALLOrders(): Promise<Order[] | undefined>;
    createOrder(order: Order): Promise<{ order_id: string, status: string }>;
    updateStatus(order: Order): Promise<Order>;
    getOrderById(order_id: string): Promise<Order | undefined>;
}

// [Driven/Resource] Adapter
export class OrderRepositoryDatabase implements OrderRepository {
    
    private db: Knex;
    constructor(readonly databaseConnection: QueryBuilderDatabaseConnection<Knex>) {
        this.db = this.databaseConnection.builder();
    }
    async getALLOrders(): Promise<Order[] | undefined> {
        const orders = await this.db<any>("orders").select("*");
        const ordersWithProducts = await Promise.all(orders.map(async (order) => {
            const orderItemsData = await this.db("order_items").where({ order_id: order.order_id });
            const orderProducts = orderItemsData.map((item: OrderItem) => 
                new OrderProduct(item.order_item_id, item.product_id, item.quantity, item.price)
            );
            return Order.restore(order.order_id, orderProducts, order.status, order.created_at, order.client_id);
        }));
        return ordersWithProducts;
    }
    async createOrder(order: Order): Promise<{ order_id: string, status: string }> {
        const trx = await this.db.transaction();
       
        try {
            const [insertedOrder] = await trx("orders").insert({
                order_id: order.order_id,
                status: order.getStatus(),
                client_id: order.client_id,
                created_at: order.created_at
            }).returning("*");

            const orderItems = order.products.map((item) => ({
                order_id: order.order_id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                order_item_id: item.order_item_id
            }));

            await trx("order_items").insert(orderItems);

            await trx.commit();
            return { order_id: insertedOrder.order_id, status: insertedOrder.status };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
    async updateStatus(order: Order): Promise<Order> {
        const trx = await this.db.transaction();
        try {
            const [updatedOrder] = await trx("orders").where({ order_id: order.order_id }).update({
                status: order.getStatus(),
            }).returning("*");

            await trx("order_items").where({ order_id: order.order_id }).delete();

            const orderItems = order.products.map((item) => ({
                order_id: order.order_id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                order_item_id: item.order_item_id
            }));

            await trx("order_items").insert(orderItems);

            await trx.commit();
            return Order.restore(updatedOrder.order_id, order.products, updatedOrder.status, updatedOrder.client_id);
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
    async getOrderById(order_id: string): Promise<Order | undefined> {
        const order = await this.db<any>("orders").where({ order_id }).first();
        if (!order) {
            return undefined;
        }
        const orderItemsData = await this.db("order_items").where({ order_id });
        const orderProducts = orderItemsData.map((item: OrderItem) => 
            new OrderProduct(item.order_item_id, item.product_id, item.quantity, item.price));

        return Order.restore(order.order_id, orderProducts, order.status, order.created_at, order.client_id); 
    }
}


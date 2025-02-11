import ClientGateway from "../gateway/ClientGateway";
import { OrderRepository } from "../../infra/repository/OrderRepository";
import { ProductRepository } from "../../infra/repository/ProductRepository";

enum OrderStatusPriority {
  ready = 1,        
  preparing = 2,   
  received = 3     
}

export class GetAllOrders {
  constructor(readonly orderRepository: OrderRepository, readonly productRepository: ProductRepository, readonly clientGateway: ClientGateway) {}

  async execute(): Promise<Output | undefined> {
    const orders = await this.orderRepository.getALLOrders();
    if (!orders) {
      return [];
    }

    const filteredOrders = orders.filter((order) => order.getStatus() !== "finished");
    const ordersWithData = await Promise.all(
      filteredOrders.map(async (orderRestored) => {
        const products = await Promise.all(
          orderRestored.products.map(async (product) => {
            const productData = await this.productRepository.getProductById(product.product_id);
            if (!productData) {
              throw new Error(`Product with id ${product.product_id} not found`);
            }
            return {
              product_id: product.product_id,
              quantity: product.quantity,
              name: productData.name,
              description: productData.description,
              price: product.price,
              category: productData.category
            };
          })
        );
        let clientName: string | undefined;
        if (orderRestored.client_id) {
          const client = await this.clientGateway.getClientById(orderRestored.client_id);
          clientName = client?.name;
        }

        return {
          order_id: orderRestored.order_id,
          total_price: orderRestored.calculateTotalPrice(),
          status: orderRestored.getStatus(),
          client_name: clientName,
          products,
          created_at: orderRestored.created_at
        };
      })
    );

    const ordersSorted = ordersWithData.sort((a, b) => {
      return OrderStatusPriority[a.status as keyof typeof OrderStatusPriority] - OrderStatusPriority[b.status as keyof typeof OrderStatusPriority];
    });

    return ordersSorted;
  }
}

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
}[]

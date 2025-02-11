import ClientGateway from "../gateway/ClientGateway";
import Order from "../../domain/entity/Order";
import { OrderRepository } from "../../infra/repository/OrderRepository";
import { ProductRepository } from "../../infra/repository/ProductRepository";

export class CreateOrder {
  constructor(readonly orderRepository: OrderRepository, readonly productRepository: ProductRepository, readonly clientGateway: ClientGateway) {}

  async execute({ client_id, products }: Input): Promise<Output> {

    if (client_id) {
      try {
      await this.clientGateway.getClientById(client_id);
      } catch (error: any) {
        throw new Error(error.response.data.message);
      }
    }
    
    const productsPromisses = products.map(async product => {
    const productItem = await this.productRepository.getProductById(product.product_id);
      if (!productItem) {
        throw new Error("Some product does not exist");
      }
      return productItem
    });

    const restoredProducts = await Promise.all(productsPromisses);

    const productsWithPrice = products.map((product) => {
        const price = restoredProducts.find(restoredProduct => restoredProduct!.product_id === product.product_id)!.price;
      return {
        product_id: product.product_id,
        quantity: product.quantity,
        price
      }
    });

    const order = Order.create({ client_id, products: productsWithPrice }); 
    const insertedOrder = await this.orderRepository.createOrder(order); 

    return {
      order_id: insertedOrder.order_id
    };
  }
}

type Input = {
  client_id: string;
  products: {
      product_id: string;
      quantity: number;
  }[];
};

type Output = {
    order_id: string
};
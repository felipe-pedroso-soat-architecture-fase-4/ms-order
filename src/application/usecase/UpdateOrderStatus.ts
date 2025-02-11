import Order from "../../domain/entity/Order";
import { OrderRepository } from "../../infra/repository/OrderRepository";

const statusNameMap = {
  finished: "finish",
  ready: "ready",
  preparing: "prepare",
  received: "receive"
}


export class UpdateOrderStatus {
  constructor(readonly orderRepository: OrderRepository) {}

  async execute({ order_id, status }: Input): Promise<string> {
    const orderRestored = await this.orderRepository.getOrderById(order_id);
    if (!orderRestored) {
        throw new Error("Order not found");
    }
    
    const statusNameFunction = statusNameMap[status] as keyof Order;
    const statusFunction = (orderRestored[statusNameFunction!] as () => void).bind(orderRestored);
    if (typeof statusFunction === "function") {
         statusFunction();
    } else {
        throw new Error("Invalid status");
    }

    const updatedOrderResult = await this.orderRepository.updateStatus(orderRestored);
    return updatedOrderResult.getStatus();
  }
}

type Input = {
    order_id: string;
    status: "finished" | "ready" | "preparing" | "received"
};


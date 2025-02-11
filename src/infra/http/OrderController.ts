import { CreateOrder } from "../../application/usecase/CreateOrder";
import { GetAllOrders } from "../../application/usecase/GetAllOrders";
import GetOrder from "../../application/usecase/GetOrder";
import HttpServer from "./HttpServer";
import { UpdateOrderStatus } from "../../application/usecase/UpdateOrderStatus";

export default class OrderController {
    constructor(readonly httpServer: HttpServer, readonly createOrder: CreateOrder, readonly getOrder: GetOrder, readonly getAllOrders: GetAllOrders, readonly updateOrderStatus: UpdateOrderStatus) {

        httpServer.register("post", "/orders", async (req: any) => { 
            const output = await createOrder.execute(req.body);
            return output;
        });
        httpServer.register("get", "/orders", async (req: any) => {
            const output = await getAllOrders.execute();
            return output;
        });
        httpServer.register("get", "/orders/:order_id", async (req: any) => {
            const output = await getOrder.execute(req.params);
            return output;
        });
        httpServer.register("put", "/orders/status/:order_id", async (req: any) => {
            const order_id = req.params.order_id;
           
            const output = await updateOrderStatus.execute({ order_id, status: req.body.status });
            return output;
        })
    }
}
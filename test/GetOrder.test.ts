import { AxiosAdapter } from "../src/infra/http/HttpClient";
import ClientGatewayHttp from "../src/infra/gateway/ClientGatewayHttp";
import { CreateOrder } from "../src/application/usecase/CreateOrder";
import { CreateProduct } from "../src/application/usecase/CreateProduct";
import GetOrder from "../src/application/usecase/GetOrder";
import { KnexAdapter } from "../src/infra/database/QueryBuilderDatabaseConnection";
import { OrderRepositoryDatabase } from "../src/infra/repository/OrderRepository";
import { ProductRepositoryDatabase } from "../src/infra/repository/ProductRepository";

describe('GetOrder.test.ts', () => {
    it('should get order correctly', async () => {
        const connection = new KnexAdapter();
        const orderRepository = new OrderRepositoryDatabase(connection);
        const productRepository = new ProductRepositoryDatabase(connection);
        const createProduct = new CreateProduct(productRepository)
        const clientGateway = new ClientGatewayHttp(new AxiosAdapter());

        const input = {
            name: "John Test",
            email: `john.doe${Math.random()}@gmail.com`,
            cpf: "87748248800",
          };
       
          const outputClient = await clientGateway.registerClient(input);
        
        const product1 = await createProduct.execute({ name: 'product1', description: 'description1', price: 10, category: 'drink' })
        const product2 = await createProduct.execute({ name: 'product2', description: 'description2', price: 30, category: 'drink' })
        const createOrder = new CreateOrder(orderRepository, productRepository, clientGateway)

        const orderProdcuts = [
            { product_id: product1.product_id, quantity: 2, price: product1.price },
            { product_id: product2.product_id, quantity: 1, price: product2.price }
        ]
        
        const outputCreateOrder = await createOrder.execute({ client_id: outputClient!.account_id, products: orderProdcuts })
        const getOrder = new GetOrder(orderRepository, productRepository, clientGateway);
        const order = await getOrder.execute({ order_id: outputCreateOrder.order_id });
       
        expect(order?.order_id).toBeDefined();
        expect(order?.products).toHaveLength(2);
        expect(order?.client_name).toBe(input.name)
        expect(order?.status).toBe('pending')
        expect(order?.total_price).toBe(40)
        await connection.close();
    })
})

import { AxiosAdapter } from "./src/infra/http/HttpClient";
import ClientGatewayHttp from "./src/infra/gateway/ClientGatewayHttp";
import { CreateOrder } from "./src/application/usecase/CreateOrder";
import { CreateProduct } from "./src/application/usecase/CreateProduct";
import { ExpressAdapter } from "./src/infra/http/HttpServer";
import { GetAllOrders } from "./src/application/usecase/GetAllOrders";
import { GetAllProductsByCategory } from "./src/application/usecase/GetAllProductsByCategory";
import GetOrder from "./src/application/usecase/GetOrder";
import { KnexAdapter } from "./src/infra/database/QueryBuilderDatabaseConnection";
import OrderController from "./src/infra/http/OrderController";
import { OrderRepositoryDatabase } from "./src/infra/repository/OrderRepository";
import ProductController from "./src/infra/http/ProductController";
import { ProductRepositoryDatabase } from "./src/infra/repository/ProductRepository";
import { RemoveProduct } from "./src/application/usecase/RemoveProduct";
import { UpdateOrderStatus } from "./src/application/usecase/UpdateOrderStatus";
import { UpdateProduct } from "./src/application/usecase/UpdateProduct";
import { config } from "./src/infra/database/config";
import dotenv from 'dotenv';
import knex from "knex";

dotenv.config();

const environment = process.env.NODE_ENV || "development";
const port = Number(process.env.API_PORT || 3000);

const defaultConfig = config[environment]
const defaultConfigPostgres = {
  ...defaultConfig,
  connection: typeof defaultConfig.connection === 'object' ? { ...defaultConfig.connection, database: 'postgres' } : defaultConfig.connection
};

const dbPostgres = knex(defaultConfigPostgres);
async function createDatabase() {
  const databases = await dbPostgres.raw("SELECT datname FROM pg_database WHERE datname = 'ms_order_db';");
  if (databases.rows.length === 0) {
      await dbPostgres.raw('CREATE DATABASE "ms_order_db";');
      console.log("Banco de dados 'ms_order_db' criado.");
  } else {
      console.log("Banco de dados 'ms_order_db' já existe.");
  }
}

async function createTables() {
  const db = knex(defaultConfig);

    const productsExists = await db.schema.hasTable('products');
    if (!productsExists) {
      await db.schema.createTable('products', (table) => {
        table.uuid('product_id').primary();
        table.string('name').notNullable();
        table.string('description').notNullable();
        table.float('price').notNullable();
        table.string('category').notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log("Tabela 'products' criada");
    }
  
    // Criar tabela de pedidos
    const ordersExists = await db.schema.hasTable('orders');
    if (!ordersExists) {
      await db.schema.createTable('orders', (table) => {
        table.uuid('order_id').primary();
        table.uuid('client_id').nullable(); 
        table.string('status').notNullable();
        table.timestamp('created_at').notNullable();
      });
      console.log("Tabela 'orders' criada");
    }
  
    // Criar tabela de itens do pedido
    const orderItemsExists = await db.schema.hasTable('order_items');
    if (!orderItemsExists) {
      await db.schema.createTable('order_items', (table) => {
        table.uuid('order_item_id').primary();
        table.uuid('order_id').references('order_id').inTable('orders').onDelete('CASCADE');
        table.uuid('product_id').references('product_id').inTable('products');
        table.integer('quantity').notNullable();
        table.float('price').notNullable();
      });
      console.log("Tabela 'order_items' criada");
    }
}

createDatabase().then(() => createTables()).catch((err) => {
    console.error('Erro ao criar banco de dados ou tabelas:', err);
  }).finally(() => {
    dbPostgres.destroy();
  });

const httpServer = new ExpressAdapter();
const connection = new KnexAdapter();
const clientGateway = new ClientGatewayHttp(new AxiosAdapter());

//ms2
const productRepository = new ProductRepositoryDatabase(connection);
const createProduct = new CreateProduct(productRepository);
const updateProduct = new UpdateProduct(productRepository);
const removeProduct = new RemoveProduct(productRepository);
const getAllProductsByCategory = new GetAllProductsByCategory(productRepository);
new ProductController(httpServer, createProduct, updateProduct, removeProduct, getAllProductsByCategory);

const orderRepository = new OrderRepositoryDatabase(connection);
const createOrder = new CreateOrder(orderRepository, productRepository, clientGateway);
const getOrder = new GetOrder(orderRepository, productRepository, clientGateway);
const getAllOrders = new GetAllOrders(orderRepository, productRepository, clientGateway);
const updateOrderStatus = new UpdateOrderStatus(orderRepository);
new OrderController(httpServer, createOrder, getOrder, getAllOrders, updateOrderStatus);


httpServer.listen(port);
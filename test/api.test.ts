import axios from "axios";
import dotenv from 'dotenv';
import { randomUUID } from "crypto";

dotenv.config();

axios.defaults.validateStatus = function () {
  return true;
};

describe('Order', () => {
  it("should create an order with client identification correctly", async () => {
    const client = {
      name: "John Test",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "87748248800",
    };
    const responseClient = await axios.post(
      `${process.env.API_CLIENT_GATEWAY}/clients`,
      client,
    );
    const client_id = responseClient.data.account_id;

    const product = {
      name: "Product Test",
      description: "Product Test Description",
      price: 10.0,
      category: "Test",
    };
    const responseProduct = await axios.post(
      `${process.env.API_URL}:${process.env.API_PORT}/products`,
      product,
    );
    const product_id = responseProduct.data.product_id;

    const order = {
      client_id,
      products: [
        {
          product_id,
          quantity: 2
        },
      ],
    };
    const responseOrder = await axios.post(
      `${process.env.API_URL}:${process.env.API_PORT}/orders`,
      order,
    );
    const outputOrder = responseOrder.data;
    expect(outputOrder.order_id).toBeDefined();
  });
  
  it("should create an order without client identification correctly", async () => {
    const product = {
      name: "Product Test",
      description: "Product Test Description",
      price: 10.0,
      category: "Test",
    };
    const responseProduct = await axios.post(
      `${process.env.API_URL}:${process.env.API_PORT}/products`,
      product,
    );
    const product_id = responseProduct.data.product_id;
    
    const order = {
      products: [
        {
          product_id,
          quantity: 2
        },
      ],
    };
    const responseOrder = await axios.post(
      `${process.env.API_URL}:${process.env.API_PORT}/orders`,
      order,
    );
    const outputOrder = responseOrder.data;
    expect(outputOrder.order_id).toBeDefined();
  });

  it("should return an error if the client not found", async () => {
    const order = {
      client_id: randomUUID(),
      products: [
        {
          product_id: randomUUID(),
          quantity: 2
        },
      ],
    };
    const responseOrder = await axios.post(
      `${process.env.API_URL}:${process.env.API_PORT}/orders`,
      order,
    );
    expect(responseOrder.status).toBe(422);
    expect(responseOrder.data.message).toBe("Client not found");
  });

  it("should return an error if the product not found", async () => {
    const client = {
      name: "John Test",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "87748248800",
    };
    const responseClient = await axios.post(
      `${process.env.API_CLIENT_GATEWAY}/clients`,
      client,
    );
    const client_id = responseClient.data.account_id;

    const order = {
      client_id,
      products: [
        {
          product_id: randomUUID(),
          quantity: 2
        },
      ],
    };
    const responseOrder = await axios.post(
    `${process.env.API_URL}:${process.env.API_PORT}/orders`,
      order,
    );
    expect(responseOrder.status).toBe(422);
    expect(responseOrder.data.message).toBe("Some product does not exist");
  });

  it("should update order status correctly", async () => {
    const client = {
      name: "John Test",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "87748248800",
    };
    const responseClient = await axios.post(
      `${process.env.API_CLIENT_GATEWAY}/clients`,
      client,
    );
    const client_id = responseClient.data.account_id;

    const product = {
      name: "Product Test",
      description: "Product Test Description",
      price: 10.0,
      category: "Test",
    };
    const responseProduct = await axios.post(
      `${process.env.API_URL}:${process.env.API_PORT}/products`,
      product,
    );
    const product_id = responseProduct.data.product_id;

    const order = {
      client_id,
      products: [
        {
          product_id,
          quantity: 2
        },
      ],
    };
    const responseOrder = await axios.post(
      `${process.env.API_URL}:${process.env.API_PORT}/orders`,
      order,
    );
    
    const order_id = responseOrder.data.order_id;
    const payment = {
      order_id,
      payment_method: "Pix",
    };
    
    const paymentsResponse = await axios.post(
      `${process.env.API_PAYMENT_GATEWAY}/payments`,
      payment,
    );

    expect(paymentsResponse.status).toBe(200);

    const responseUpdateOrderStatus = await axios.put( 
      `${process.env.API_URL}:${process.env.API_PORT}/orders/status/${order_id}`,
      { status: "preparing" },
    );
    const outputUpdateOrderStatus = responseUpdateOrderStatus.data;
    expect(outputUpdateOrderStatus).toBe("preparing");
  });
})

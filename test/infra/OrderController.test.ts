import { CreateOrder } from '../../src/application/usecase/CreateOrder';
import { ExpressAdapter } from '../../src/infra/http/HttpServer';
import { GetAllOrders } from '../../src/application/usecase/GetAllOrders';
import GetOrder from '../../src/application/usecase/GetOrder';
import OrderController from '../../src/infra/http/OrderController';
import { UpdateOrderStatus } from '../../src/application/usecase/UpdateOrderStatus';
import express from 'express';
import request from 'supertest';

describe('OrderController', () => {
  let app: express.Application;
  let createOrder: CreateOrder;
  let getAllOrders: GetAllOrders;
  let getOrder: GetOrder;
  let updateOrderStatus: UpdateOrderStatus;

  beforeEach(() => {
    const httpServer = new ExpressAdapter();
    app = httpServer['app'];

    createOrder = {
      execute: jest.fn().mockResolvedValue({ orderId: '1', status: 'created' })
    } as any;
    getAllOrders = {
      execute: jest.fn().mockResolvedValue([{ orderId: '1', status: 'created' }])
    } as any;
    getOrder = {
      execute: jest.fn().mockResolvedValue({ orderId: '1', status: 'created' })
    } as any;
    updateOrderStatus = {
      execute: jest.fn().mockResolvedValue({ orderId: '1', status: 'updated' })
    } as any;

    new OrderController(httpServer, createOrder, getOrder, getAllOrders, updateOrderStatus);
  });

  it('should create an order', async () => {
    const response = await request(app)
      .post('/orders')
      .send({ item: 'item1', quantity: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ orderId: '1', status: 'created' });
    expect(createOrder.execute).toHaveBeenCalledWith({ item: 'item1', quantity: 1 });
  });

  it('should get all orders', async () => {
    const response = await request(app).get('/orders');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ orderId: '1', status: 'created' }]);
    expect(getAllOrders.execute).toHaveBeenCalled();
  });

  it('should get an order by id', async () => {
    const response = await request(app).get('/orders/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ orderId: '1', status: 'created' });
    expect(getOrder.execute).toHaveBeenCalledWith({ order_id: '1' });
  });

  it('should update order status', async () => {
    const response = await request(app)
      .put('/orders/status/1')
      .send({ status: 'updated' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ orderId: '1', status: 'updated' });
    expect(updateOrderStatus.execute).toHaveBeenCalledWith({ order_id: '1', status: 'updated' });
  });
});
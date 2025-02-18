import { CreateProduct } from '../../src/application/usecase/CreateProduct';
import { ExpressAdapter } from '../../src/infra/http/HttpServer';
import { GetAllProductsByCategory } from '../../src/application/usecase/GetAllProductsByCategory';
import ProductController from '../../src/infra/http/ProductController';
import { RemoveProduct } from '../../src/application/usecase/RemoveProduct';
import { UpdateProduct } from '../../src/application/usecase/UpdateProduct';
import express from 'express';
import request from 'supertest';

describe('ProductController', () => {
  let app: express.Application;
  let createProduct: CreateProduct;
  let updateProduct: UpdateProduct;
  let removeProduct: RemoveProduct;
  let getAllProductsByCategory: GetAllProductsByCategory;

  beforeEach(() => {
    const httpServer = new ExpressAdapter();
    app = httpServer['app'];

    createProduct = {
      execute: jest.fn().mockResolvedValue({ productId: '1', name: 'Product 1' })
    } as any;
    updateProduct = {
      execute: jest.fn().mockResolvedValue({ productId: '1', name: 'Updated Product 1' })
    } as any;
    removeProduct = {
      execute: jest.fn().mockResolvedValue({ productId: '1' })
    } as any;
    getAllProductsByCategory = {
      execute: jest.fn().mockResolvedValue([{ productId: '1', name: 'Product 1' }])
    } as any;

    new ProductController(httpServer, createProduct, updateProduct, removeProduct, getAllProductsByCategory);
  });

  it('should create a product', async () => {
    const response = await request(app)
      .post('/products')
      .send({ name: 'Product 1', description: 'Description 1', price: 100, category: 'Category 1' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ productId: '1', name: 'Product 1' });
    expect(createProduct.execute).toHaveBeenCalledWith({ name: 'Product 1', description: 'Description 1', price: 100, category: 'Category 1' });
  });

  it('should update a product', async () => {
    const response = await request(app)
      .put('/products/1')
      .send({ name: 'Updated Product 1', description: 'Updated Description 1', price: 150, category: 'Category 1' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ productId: '1', name: 'Updated Product 1' });
    expect(updateProduct.execute).toHaveBeenCalledWith({ product_id: '1', name: 'Updated Product 1', description: 'Updated Description 1', price: 150, category: 'Category 1' });
  });

  it('should remove a product', async () => {
    const response = await request(app).delete('/products/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ productId: '1' });
    expect(removeProduct.execute).toHaveBeenCalledWith('1');
  });

  it('should get all products by category', async () => {
    const response = await request(app).get('/products/Category 1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ productId: '1', name: 'Product 1' }]);
    expect(getAllProductsByCategory.execute).toHaveBeenCalledWith('Category 1');
  });
});
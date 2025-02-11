import { CreateProduct } from "../src/application/usecase/CreateProduct";
import { KnexAdapter } from "../src/infra/database/QueryBuilderDatabaseConnection";
import { ProductRepositoryDatabase } from "../src/infra/repository/ProductRepository";
import { RemoveProduct } from "../src/application/usecase/RemoveProduct";
import { randomUUID } from "crypto";

describe('RemoveProduct.test', () => {

      let productRepository: ProductRepositoryDatabase;
      let createProduct: CreateProduct;
      let connection: KnexAdapter;
    
      beforeEach(() => {
        connection = new KnexAdapter();
        productRepository = new ProductRepositoryDatabase(connection);
        createProduct = new CreateProduct(productRepository);
      });
    

    it('should remove a product correctly', async () => {
       jest.spyOn(productRepository, 'removeProduct')

        const product = {
            name: 'Product 1',
            description: 'Description 1',
            price: 100,
            category: 'drink',
        };
        const createdProduct = await createProduct.execute(product);
        const removeProduct = new RemoveProduct(productRepository);
        const removedProduct = await removeProduct.execute(createdProduct.product_id);
        
        expect(removedProduct).toHaveProperty('product_id', createdProduct.product_id);
        expect(removedProduct).toEqual(expect.objectContaining(product));
        expect(productRepository.removeProduct).toHaveBeenCalledTimes(1);
        expect(productRepository.removeProduct).toHaveBeenCalledWith(createdProduct.product_id);
    })

    it('should throw an error when the product is not found', async () => {
        const removeProduct = new RemoveProduct(productRepository);
        const product_id = randomUUID();

        await expect(removeProduct.execute(product_id)).rejects.toThrow('Product not found');
    })

    afterEach(async () => {
        await connection.close();
    });
})

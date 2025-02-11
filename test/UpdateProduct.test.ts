import { CreateProduct } from "../src/application/usecase/CreateProduct";
import { KnexAdapter } from "../src/infra/database/QueryBuilderDatabaseConnection";
import { ProductRepositoryDatabase } from "../src/infra/repository/ProductRepository";
import { UpdateProduct } from "../src/application/usecase/UpdateProduct";

describe('UpdateProduct.test', () => {
    it('should update a product correctly', async () => {
        const connection = new KnexAdapter();
        const productRepository = new ProductRepositoryDatabase(connection);
        const createProduct = new CreateProduct(productRepository);
        const updateProduct = new UpdateProduct(productRepository);
        const product = {
            name: 'Product 1',
            description: 'Description 1',
            price: 100,
            category: 'drink',
        };
        const createdProduct = await createProduct.execute(product); 

        const updatedProduct = {
            product_id: createdProduct.product_id,
            name: 'Product 2',
            description: 'Description 2',
            price: 200,
            category: 'dessert',
        };
        const updatedProductResult = await updateProduct.execute(updatedProduct); 
        
        expect(updatedProductResult).toHaveProperty('product_id', createdProduct.product_id);
        expect(updatedProductResult).toHaveProperty('name', updatedProduct.name);
        expect(updatedProductResult).toHaveProperty('description', updatedProduct.description);
        expect(updatedProductResult).toHaveProperty('price', updatedProduct.price);
        expect(updatedProductResult).toHaveProperty('category', updatedProduct.category);

        await connection.close();
    })
})

import { CreateProduct } from "../src/application/usecase/CreateProduct";
import { GetAllProductsByCategory } from "../src/application/usecase/GetAllProductsByCategory";
import { KnexAdapter } from "../src/infra/database/QueryBuilderDatabaseConnection";
import { ProductRepositoryDatabase } from "../src/infra/repository/ProductRepository";

describe('GetAllProductsByCategory', () => {
  let productRepository: ProductRepositoryDatabase;
  let getAllProductsByCategory: GetAllProductsByCategory;
  let createProduct: CreateProduct;
  let connection: KnexAdapter;

  beforeEach(() => {
    connection = new KnexAdapter();
    productRepository = new ProductRepositoryDatabase(connection);
    getAllProductsByCategory = new GetAllProductsByCategory(productRepository);
    createProduct = new CreateProduct(productRepository);
  });

  it('should return all products of a given category', async () => {
    const randomCategoryName = `category_${Math.random()}`;
     const product1 = await createProduct.execute({
            name: 'Product 1',
            description: 'Description 1',
            price: 10,
            category: randomCategoryName,
     });

    const product2 = await createProduct.execute({
            name: 'Product 2',
            description: 'Description 2',
            price: 20,
            category: randomCategoryName,
    });

    await createProduct.execute({
            name: 'Product 3',
            description: 'Description 3',
            price: 30,
            category: 'snack',
    });

    const products = await getAllProductsByCategory.execute(randomCategoryName);

    expect(products).toHaveLength(2);
    expect(products).toEqual(expect.arrayContaining([product1, product2]));
  });

  it('should return an empty array if no products are found for the given category', async () => {
     
    const products = await getAllProductsByCategory.execute('category_not_registered');
    expect(products).toHaveLength(0);
  });


  afterEach(async () => {
    await connection.close();
  });
});
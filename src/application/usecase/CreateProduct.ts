import Product from "../../domain/entity/Product";
import { ProductRepository } from "../../infra/repository/ProductRepository";

export class CreateProduct {
  constructor(readonly productRepository: ProductRepository) {}

  async execute({ name, description, price, category }: any): Promise<Product> {
    const product = Product.create(name, description, price, category);

    const insertedProduct = await this.productRepository.createProduct(product);
    return insertedProduct;
  }
}
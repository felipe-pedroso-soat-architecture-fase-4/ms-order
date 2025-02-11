import Product from "../../domain/entity/Product";
import { ProductRepository } from "../../infra/repository/ProductRepository";

export class GetAllProductsByCategory {
  constructor(readonly productRepository: ProductRepository) {}

  async execute(category: string): Promise<Product[] | undefined> {
    const products = await this.productRepository.getALLProductsByCategory(category);
    return products;
  }
}
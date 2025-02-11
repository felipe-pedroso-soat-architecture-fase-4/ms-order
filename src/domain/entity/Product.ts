import { randomUUID } from "crypto";

export default class Product {
 
  private constructor(
    readonly product_id: string,
    readonly name: string,
    readonly description: string,
    readonly price: number,
    readonly category: string,
  ) {}

//static factory method
  static create(
    name: string,
    description: string,
    price: number,
    category: string
  ) {
    const product_id = randomUUID();
    return new Product(product_id, name, description, price, category);
  }

  //static factory method
    static restore(
        product_id: string,
        name: string,
        description: string,
        price: number,
        category: string
    ) {
        return new Product(product_id, name, description, price, category);
    }
}
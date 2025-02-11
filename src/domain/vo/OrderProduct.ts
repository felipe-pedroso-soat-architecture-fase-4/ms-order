
export default class OrderProduct {
     constructor(
        readonly order_item_id: string,
        readonly product_id: string,
        readonly quantity: number,
        readonly price: number,
    ) {
        const isBiggerThanZero = quantity > 0;  
        if (!isBiggerThanZero) {
            throw new Error("Quantity must be bigger than 0");
        }
    }
}
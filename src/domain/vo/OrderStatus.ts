import Order from "../entity/Order";

//state design pattern

export default abstract class OrderStatus {
	abstract value: string;

	constructor (readonly order: Order) {
	}

	abstract receive(): void;
	abstract prepare(): void;
	abstract ready(): void;
    abstract finish(): void;
}

export class PendingStatus extends OrderStatus {
    value: string;


    constructor(readonly order: Order) {
        super(order);
        this.value = "pending";
    }

    receive(): void {
        this.order.status = new ReceivedStatus(this.order);
    }

    prepare(): void {
        throw new Error("Invalid status");
    }

    ready(): void {
        throw new Error("Invalid status");
    }

    finish(): void {
        throw new Error("Invalid status");
    }
}

export class ReceivedStatus extends OrderStatus {
    value: string;

    constructor(readonly order: Order) {
        super(order);
        this.value = "received";
    }

    receive(): void {
        throw new Error("Invalid status");
    }

    prepare(): void {
        this.order.status = new PreparingStatus(this.order);
    }

    ready(): void {
        throw new Error("Invalid status");
    }

    finish(): void {
        throw new Error("Invalid status");
    }
}

export class PreparingStatus extends OrderStatus {
    value: string;

    constructor(readonly order: Order) {
        super(order);
        this.value = "preparing";
    }

    receive(): void {
        throw new Error("Invalid status");
    }

    prepare(): void {
        throw new Error("Invalid status");
    }

    ready(): void {
        this.order.status = new ReadyStatus(this.order);
    }

    finish(): void {
        throw new Error("Invalid status");
    }
}

export class ReadyStatus extends OrderStatus {
    value: string;

    constructor(readonly order: Order) {
        super(order);
        this.value = "ready";
    }

    receive(): void {
        throw new Error("Invalid status");
    }

    prepare(): void {
        throw new Error("Invalid status");
    }

    ready(): void {
        throw new Error("Invalid status");
    }

    finish(): void {
        this.order.status = new FinishedStatus(this.order);
    }
}

export class FinishedStatus extends OrderStatus {
    value: string;

    constructor(readonly order: Order) {
        super(order);
        this.value = "finished";
    }

    receive(): void {
        throw new Error("Invalid status");
    }

    prepare(): void {
        throw new Error("Invalid status");
    }

    ready(): void {
        throw new Error("Invalid status");
    }

    finish(): void {
        throw new Error("Invalid status");
    }
}

export class OrderStatusFactory {
	static create (order: Order, status: string) {
		if (status === "pending") return new PendingStatus(order);
		if (status === "received") return new ReceivedStatus(order);
		if (status === "preparing") return new PreparingStatus(order);
        if (status === "ready") return new ReadyStatus(order);
        if (status === "finished") return new FinishedStatus(order);
		throw new Error();
	}
}
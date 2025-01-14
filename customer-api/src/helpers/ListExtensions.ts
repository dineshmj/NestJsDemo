export {};

declare global {
    interface Array<T> {
        isNullOrEmpty (): T | undefined;
    }
}

Array.prototype.isNullOrEmpty = function () {
    return !this || this.length === 0;
}
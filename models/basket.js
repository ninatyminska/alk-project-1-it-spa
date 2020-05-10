module.exports = function Basket(prevBasket) {
    this.items = prevBasket.items || {};
    this.totalQty = prevBasket.totalQty || 0;
    this.totalPrice = prevBasket.totalPrice || 0;

    this.addItem = function (item, id, dateArr, dateDep) {
        var storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = {
                item: item,
                dateArr: '',
                dateDep: '',
                qty: 0,
                price: 0,
            };
        }

        if (dateArr && dateDep) {
            storedItem.dateArr = dateArr;
            storedItem.dateDep = dateDep;
        }

        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    };

    this.removeOne = function (id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

        if (this.items[id].qty <= 0) {
            delete this.items[id];
        }
    };

    this.removeItem = function (id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    };
};

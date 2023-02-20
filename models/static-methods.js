const Order = require("./order");

exports.incrementFromCart = async function (productId) {
  const prodIndex = this.cart.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );
  let items = [...this.cart.items];

  items = items.map((item, index) => {
    if (index === prodIndex) {
      item.quantity++;
    }
    return item;
  });
  this.cart.items = items;
  return await this.save();
};

exports.decrementFromCart = async function (productId) {
  const prodIndex = this.cart.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );
  let items = [...this.cart.items];
  let qty = items[prodIndex].quantity;
  if (qty < 2) {
    return await this.removeFromCart(productId);
  }
  qty--; // decrement quantity
  items = items.map((item, index) => {
    if (index === prodIndex) {
      item.quantity = qty;
    }
    return item;
  });
  this.cart.items = items;
  return await this.save();
};

exports.removeFromCart = async function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return await this.save();
};

exports.addToCart = async function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return await this.save();
};

exports.addOrder = async function () {
  try {
    const user = await this.populate("cart.items.productId");
    const items = user.cart.items;
    console.log(items, "items");
    this.cart = { items: [] };
    const products = items.map((item) => {
      return { quantity: item.quantity, product: { ...item.productId._doc } };
    });
    const order = new Order({
      products,
      user: { email: this.email, userId: this._id },
    });
    console.log(order, "my order");
    await order.save();
    await this.save();
  } catch (err) {
    console.error(err);
  }
};

exports.getOrders = async function () {
  try {
    return await Order.find({ "user.userId": this._id });
  } catch (err) {
    console.error(err);
  }
};

const mongoose = require("mongoose");
const {
  addToCart,
  removeFromCart,
  decrementFromCart,
  incrementFromCart,
  addOrder,
  getOrders,
} = require("./static-methods");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: Boolean,
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});
/* Add some useful static methods */
userSchema.methods.addToCart = addToCart;
userSchema.methods.removeFromCart = removeFromCart;
userSchema.methods.incrementFromCart = incrementFromCart;
userSchema.methods.decrementFromCart = decrementFromCart;
userSchema.methods.addOrder = addOrder;
userSchema.methods.getOrders = getOrders;

module.exports = mongoose.model("User", userSchema);
exports.userSchema = userSchema;

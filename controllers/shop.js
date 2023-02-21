const fs = require("fs");
const path = require("path");

const PDFDoc = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const getSharedProducts = async (
  req,
  res,
  next,
  pageTitle,
  path,
  isAdmin = false
) => {
  try {
    let products;
    if (!isAdmin || req.user.is_admin) products = await Product.find();
    else products = await Product.find({ email: req.user.email });

    return res.render("shop/product-list", {
      pageTitle,
      path,
      isAdmin,
      prods: products,
      authUser: req.user,
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};
exports.getSharedProducts = getSharedProducts;

exports.getProducts = async (req, res, next) =>
  await getSharedProducts(req, res, "Shop - Products", "/products");

exports.getProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await Product.findOne({ _id: productId });
    res.render("shop/product-detail", {
      product,
      pageTitle: `Shop - Product - ${product.title}`,
      path: "/products",
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
exports.getIndex = async (req, res, next) => {
  await getSharedProducts(req, res, next, "Shop", "/");
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    //.exec()
    .then((user) => {
      const products = user.cart.items;
      const totalPrice = products.reduce((acc, cur) => {
        return acc + +cur.productId.price * cur.quantity;
      }, 0);
      res.render("shop/cart", {
        products,
        totalPrice,
        path: "/cart",
        pageTitle: "Your Cart",
      });
    })
    .catch((err) => console.error(err));
};

exports.postCart = async (req, res, next) => {
  const { productId } = req.body;
  try {
    // get user's cart
    const product = await Product.findById(productId);
    const result = await req.user.addToCart(product);
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

// add one, delete one and bulk delete cart item.
exports.postAddDeleteCartItem = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    if (req.body.bulk_delete) {
      await req.user.removeFromCart(productId);
    } else if (req.body.delete_one) {
      await req.user.decrementFromCart(productId);
    } else if (req.body.add_cart) {
      await req.user.incrementFromCart(productId);
    }
    return res.redirect("/cart");
  } catch (err) {
    console.error(err);
    return next(err);
  }

  // Check which submit button was clicked
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await req.user.getOrders();
    res.render("shop/orders", {
      orders,
      path: "/orders",
      pageTitle: "Your Orders",
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    await req.user.addOrder();
    res.redirect("/orders");
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

exports.getCheckout = (req, res, next) => {
  res.render("/shop/checkout", {
    path: "/checkout",
    pageTitle: "Your Checkout",
  });
};

exports.getInvoice = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) return next(new Error("No order found"));
    if (order.user.userId.toString() !== req.user._id.toString())
      return next(new Error("Unauthorized to access file"));
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);

    const pdfDoc = new PDFDoc();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="' + invoiceName + '"'
    );
    //pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Invoice", { underline: true });
    pdfDoc.fontSize(14);
    pdfDoc.text("----------------------------------------");
    let totalPrice = 0;
    pdfDoc.fontSize(14);
    order.products.forEach((prod) => {
      totalPrice += prod.product.price;
      pdfDoc.text(
        prod.product.title +
          " - " +
          prod.quantity +
          " x " +
          "$" +
          prod.product.price
      );
    });
    pdfDoc.text("----------------------------------------");
    pdfDoc.fontSize(20).text("Total Price $" + totalPrice);
    pdfDoc.end();

    /*fs.readFile(invoicePath, (err, data) => {
    if (err) return next(err);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + invoiceName + '"'
    );
    return res.send(data);
  });
  
    const file = fs.createReadStream(invoicePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + invoiceName + '"'
    );
    return file.pipe(res);
  */
  } catch (err) {
    return next(err);
  }
};

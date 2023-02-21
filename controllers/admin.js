const { getSharedProducts } = require("./shop");
const { deleteFile } = require("../util/file");

const Product = require("../models/product");
const { getMsg, getVMsg } = require("../validators/utils");
const postProduct = async (req, res, next = null) => {
  const { title, description, price, productId } = req.body;
  const image = req.file;

  if (!image && !productId) {
    return res.status(422).render("admin/add-edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      errorMessage: "Attached file is not an image",
      hasError: true,
      editing: false,
      product: {
        title,
        price,
        description,
      },
      validationErrors: getVMsg(req),
    });
  }
  try {
    const imageUrl = image?.path;
    if (productId) {
      const product = await Product.findOne({ _id: productId });
      if (
        !product ||
        !(
          product.userId.toString() == req.user._id.toString() ||
          req.user.is_admin
        )
      )
        return res.redirect("/");
      if (imageUrl) deleteFile(product?.imageUrl);
      if (!imageUrl) await product.updateOne({ title, price, description });
      else await product.updateOne({ title, price, description, imageUrl });
      return res.redirect('/admin/products')
    } else {
      const product = new Product({
        title,
        price,
        description,
        imageUrl,
        userId: req.user._id,
      });
      await product.save();
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
  if (productId) return res.redirect("/products/" + productId);
  return res.redirect("/products");
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/add-edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    product: {},
    editing: false,
    validationErrors: getVMsg(req),
  });
};
exports.postAddProduct = async (req, res, next) =>
  await postProduct(req, res, next);

exports.getEditProduct = async (req, res, next) => {
  let { edit } = req.query;
  edit = edit?.toLowerCase() === "true" ? true : false;

  const { productId } = req.params;
  try {
    const product = await Product.findOne({
      _id: productId,
    });
    if (product?.userId?.toString() !== req.user._id.toString()) edit = false;
    if (!edit || !product) return res.redirect("/");
    res.render("admin/add-edit-product", {
      product,
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: edit,
      validationErrors: getVMsg(req),
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

exports.postEditProduct = async (req, res, next) =>
  await postProduct(req, res, next);
exports.postDeleteProduct = async (req, res, next) => {
  const { productId, price } = req.body;
  let product;
  try {
    if (req.user.is_admin) product = await Product.findOne({ _id: productId });
    else
      product = await Product.findOne({
        _id: productId,
        userId: req.user._id.toString(),
      });
    deleteFile(product.imageUrl);
    await product.delete();
    return res.redirect("back");
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
exports.getProducts = async (req, res, next) => {
  await getSharedProducts(
    req,
    res,
    next,
    "Admin - Products",
    "/admin/products",
    true
  );
};

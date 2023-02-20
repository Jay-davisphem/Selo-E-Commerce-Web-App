const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});
/*class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = +price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : id;
    this.userId = id ? new mongodb.ObjectId(userId) : id;
  }

  async save() {
    const db = getDb();
    try {
      if (this._id)
        return await db
          .collection("products")
          .updateOne({ _id: this._id, userId: this.userId }, { $set: this });
      return await db.collection("products").insertOne(this);
    } catch (err) {
      console.error(err);
    }
  }

  static async fetchAll() {
    const db = getDb();
    try {
      const prods = await db.collection("products").find().toArray();
      return prods;
    } catch (err) {
      console.error(err);
      err;
    }
  }

  static async fetchOne(id) {
    id = new mongodb.ObjectId(id);
    const db = getDb();
    try {
      const product = await db.collection("products").find({ _id: id }).next();
      return product;
    } catch (err) {
      console.error(err);
    }
  }
  static async deleteOne(id) {
    id = new mongodb.ObjectId(id);
    const db = getDb();
    try {
      const result = await db.collection("products").deleteOne({ _id: id });
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  }
  static async updateOne(obj) {
    let { id, price, description, imageUrl, title } = obj;
    id = new mongodb.ObjectId(id);
    const db = getDb();
    try {
      const filter = { _id: id };
      const ops = {
        $set: {
          title,
          imageUrl,
          description,
          price: +price,
        },
      };
      const result = await db.collection("products").updateOne(filter, ops);
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  }
}
*/
module.exports = mongoose.model("Product", productSchema);

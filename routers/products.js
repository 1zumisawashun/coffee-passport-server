const express = require("express");
const router = express.Router();
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
  let filter = {};
  // let filter = [];// これだと通常のfindが処理できなくなる
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
    console.log(filter, "filter");
  }
  const productList = await Product.find(filter).populate("category");
  // const productList = await Product.find();
  // const productList = await Product.find().select("name");
  // const productList = await Product.find().select("name image -_id");

  if (!productList) {
    res.status(500).json({ seccess: false });
  }
  res.send(productList);
});

router.post(`/`, async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
  } catch (error) {
    return res.status(400).send({ error: "Invalid Category" });
  }

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  const savedProduct = await product.save();
  if (!savedProduct) {
    return res.status(500).send("The product connot be created !");
  }
  res.status(200).send(savedProduct);
});

router.get(`/get/count`, async (req, res) => {
  let productCount = await Product.countDocuments();
  if (!productCount) {
    res.send(500).json({ success: false });
  }
  res.send({ count: productCount });
});

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  // convert number because params is string and limit only recieve number
  let product = await Product.find({ isFeatured: true }).limit(+count);
  if (!product) {
    res.send(500).json({ success: false });
  }
  // objectで返す必要があるがproduct自体がオブジェクトなのでそのまま返している
  res.send(product);
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid Category");
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    //return updated data
    {
      new: true,
    }
  );

  if (!product) {
    return res.status(400).send("the product cannot be created !");
  }
  res.status(200).send(product);
});

router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  // const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(500).json({ seccess: false });
  }
  res.send(product);
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res.status(200).json({
          success: true,
          message: "the product is deleted",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "product cannot be deleted",
        });
      }
    })
    .catch((err) => ({
      success: false,
      error: err,
    }));
});

// MEMO:routerモジュールをexportしている。スキーマみたいに直接変数をexportできる
module.exports = router;

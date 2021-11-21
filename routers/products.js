const express = require("express");
const router = express.Router();
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
  const productList = await Product.find().populate("category");
  // const productList = await Product.find();
  // const productList = await Product.find().select("name");
  // const productList = await Product.find().select("name image -_id");

  if (!productList) {
    res.status(500).json({ seccess: false });
  }
  res.send(productList);
});

router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  // const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(500).json({ seccess: false });
  }
  res.send(product);
});

//FIXME:category一致させないと止まる。一度全て取得して照らし合わせる方が良いかも。
router.post(`/`, async (req, res) => {
  console.log(req.body.category, "check category");
  //falseの時にループする。設定の問題？promiseが関係しているっぽい
  const category = await Category.findById(req.body.category);
  console.log(category, "category");
  if (!category) {
    return res.status(400).send("Invalid Category");
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

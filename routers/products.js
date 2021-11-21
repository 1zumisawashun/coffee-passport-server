const express = require("express");
const router = express.Router();
const { Product } = require("../models/product");
const { Category } = require("../models/category");

router.get(`/`, (req, res) => {
  const product = {
    id: 1,
    name: "hair dresser",
    image: "some_url",
  };
  res.send(product);
});

//FIXME:categoryが一致しないとバグる
router.post(`/`, async (req, res) => {
  console.log("check category");
  const category = await Category.findById(req.body.category);
  console.log(category, "category");
  if (!category) {
    return res.status(400).send("Invalid Category");
  }

  console.log(req.body, "req.body");
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

// MEMO:routerモジュールをexportしている。スキーマみたいに直接変数をexportできる
module.exports = router;

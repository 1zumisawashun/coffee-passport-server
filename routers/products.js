const Product = require("../models/product");
const express = require("express");
const router = express.Router();

router.get(`/`, (req, res) => {
  const product = {
    id: 1,
    name: "hair dresser",
    image: "some_url",
  };
  res.send(product);
});

router.post(`/`, (req, res) => {
  console.log(req.body, "req.body");
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock,
  });

  product
    .save()
    .then((createdProduct) => {
      res.status(201).json(createdProduct);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        success: false,
      });
    });
});

// MEMO:routerモジュールをexportしている。スキーマみたいに直接変数をexportできる
module.exports = router;

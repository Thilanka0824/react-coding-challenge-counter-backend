var express = require("express");
var router = express.Router();

const bcrypt = require("bcryptjs/dist/bcrypt");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
const { db } = require("../mongo");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/new", function (req, res, next){
  res.send('New User Route')
})

module.exports = router;

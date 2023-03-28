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

router.post("/register", async (req, res) => {
  try {
    // const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const saltRounds = 5;
    // generating a new salt with the bcrypt genSalt function
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    //generating a hashed password using the bcrypt hash function

    const user = {
      // username: username,
      email: email,
      password: passwordHash,
      id: v4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    //creating a user in the db

    const addUser = await db().collection("users").insertOne(user);
    console.log("user", user);
    console.log("addUser", addUser);

    res.json({
      success: true,
      users: user,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await db().collection("users").findOne({
      email: email,
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User does not exist.",
      });
      return;
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.status(401).json({
        success: false,
        message: "Password was incorrect.",
      });
      return;
    }

    const userType = email.includes("codeimmersives.com") ? "admin" : "user";

    const userData = {
      date: new Date(),
      userId: user.id,
      scope: userType,
    };

    const exp = Math.floor(Date.now() / 1000) + 60 * 60; // numerical value in seconds of 1 hour
    const payload = {
      userData: userData,
      exp: exp,
    };

    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign(payload, jwtSecretKey);

    res.json({
      success: true,
      message: "Logged in successfully.",
      token: token,
      userData: userData,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});


router.get("/message", async (req, res) => {
  try {
    const tokenHeaderKey = process.env.TOKEN_HEADER_KEY; //user's token from the env variable
    const token = req.header(tokenHeaderKey); //user's token from the request headers
    console.log(tokenHeaderKey);

    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const verifiedToken = jwt.verify(token, jwtSecretKey);
    console.log(jwtSecretKey);
    console.log(verifiedToken);

    const userData = verifiedToken.userData;

    // if (!verifiedToken) {
    //   res.json({
    //     success: false,
    //     message: "ID Token could not be verified",
    //   });
    // }
    if (userData && userData.scope === "user") {
      return res.json({
        success: true,
        message: "I am a normal user",
      });
    }

    if (userData && userData.scope === "admin") {
      return res.json({
        success: true,
        message: "I am an admin user",
      });
    }

    throw Error("Access Denied");
  } catch (err) {
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

module.exports = router;

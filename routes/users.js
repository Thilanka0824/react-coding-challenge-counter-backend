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
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.email;

    const saltRounds = 5;
    // generating a new salt with the bcrypt genSalt function
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    //generating a hashed password using the bcrypt hash function

    const user = {
      username: username,
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
    console.log("user", user);
    console.log("req.body", req.body);

    if (!user) {
      res
        .json({
          success: false,
          message: "user does not exist",
        })
        .status(204);
      return;
    }
    //if a user with this email address was not found in the database, the route should respond with a success: false object

    const match = await bcrypt.compare(password, user.password);
    //bcrypt compare takes two arguments, the first is the input plain text password and the second is the hashed password that is being stored on the user document. The compare function returns a boolean which will be true of the passwords match and false if they do not

    //If the bcrypt compare function returned false, the route should respond with a success: false object
    if (!match) {
      res
        .json({
          success: false,
          message: "Password was incorrect.",
        })
        .status(204);
    }

    const userType = email.includes("codeimmersives.com") ? "admin" : "user";

    const userData = {
      date: new Date(),
      userId: user.id,
      scope: userType,
    };
    console.log("userData", userData);

    const exp = Math.floor(Date.now() / 1000) + 60 * 60;
    //numerical value in seconds of 24 hours

    const payload = {
      userData: userData,
      exp: exp,
    }

    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign(payload, jwtSecretKey)




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

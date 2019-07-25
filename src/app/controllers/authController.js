const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth");
const crypto = require("crypto");
const mailer = require("../../modules/mailer");

const User = require("../models/User");

const router = express.Router();

function generateToken({ id }) {
  token = jwt.sign({ id }, authConfig.secret, {
    expiresIn: 86400
  });
  return token;
}

router.post("/register", async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "User already exists" });

    const user = await User.create(req.body);

    user.password = undefined;
    console.log("senha undefined");

    return res.send({
      user,
      token: generateToken({ id: user.id })
    });
    console.log("erro ao criar token");
  } catch (err) {
    return res.status(400).send({ error: "Registration failed" });
  }
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) return res.status(400).send({ error: "User not found" });

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ error: "Invalid password" });

  user.password = undefined;

  res.send({
    user,
    token: generateToken({ id: user.id })
  });
});

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send({ error: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    }); /*.then(result => res.json(result._doc));*/

    /*mailer.sendMail(
      {
        to: email,
        from: "cloud.andrade16@gmail.com",
        template: "auth/forgot_password",
        context: { token }
      },
      err => {
        if (err) console.log(err);
        return res
          .status(400)
          .send({ error: "Cannot send forgot password, try again" });
      }
    );*/

    /*console.log(token, now);*/
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Error on forgot password, try again" });
  }
});

module.exports = app => app.use("/auth", router);

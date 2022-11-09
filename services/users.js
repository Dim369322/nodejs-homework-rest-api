const { User } = require("../db/usersAuthModel");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Jimp = require("jimp");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
const { sendMail } = require("../helpers/sendGridApi");

const userSignUp = async (email, password) => {
  try {
    const user = new User({
      email,
      password,
      verificationToken: uuidv4(),
    });
    await user.save();

    await sendMail(user.email, user.verificationToken);

    return user;
  } catch (error) {
    return error.message;
  }
};

const userLogin = async (email, password) => {
  try {
    const [user] = await User.find(
      { email, verify: true },
      { __v: 0, token: 0 }
    );

    if (!(await bcrypt.compare(password, user.password))) {
      throw new Error();
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET
    );

    user.token = token;
    await user.save();

    return user;
  } catch (error) {
    return error.message;
  }
};

const userLogout = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId, verify: true });

    user.token = null;
    await user.save();
  } catch (error) {
    return error.message;
  }
};

const getCurrentUser = async (token) => {
  try {
    const [user] = await User.find(
      { token, verify: true },
      { subscription: 1, email: 1, _id: 0 }
    );

    return user;
  } catch (error) {
    return error.message;
  }
};

const updateUserSubscription = async (contactId, body) => {
  try {
    const { subscription } = body;

    await User.findOneAndUpdate(
      { _id: contactId, verify: true },
      {
        $set: { subscription },
      }
    );
    const user = await User.find({ _id: contactId, verify: true });

    return user;
  } catch (error) {
    return error.message;
  }
};

const updateUserAvatar = async (contactId, file) => {
  try {
    const newAvatarPath = path.resolve(
      `./public/avatars/avatar-${uuidv4()}.png`
    );
    const avatar = await Jimp.read(`${file}`);
    avatar.resize(250, 250);
    avatar.write(file);
    await fs.rename(file, newAvatarPath);

    await User.findOneAndUpdate(
      { _id: contactId, verify: true },
      {
        $set: { avatarURL: newAvatarPath },
      }
    );
    const user = await User.find({ _id: contactId }, { avatarURL: 1, _id: 0 });
    return user;
  } catch (error) {
    await fs.unlink(file);
    return error.message;
  }
};

const verificationUserToken = async (verificationToken) => {
  try {
    const [user] = await User.find({ verificationToken });
    user.verificationToken = "null";
    user.verify = true;
    await user.save();

    return user;
  } catch (error) {
    return error.message;
  }
};

const resendingVerificationUserToken = async (email) => {
  try {
    const [user] = await User.find(
      { email, verify: false },
      { email: 1, verificationToken: 1, _id: 0 }
    );

    await sendMail(user.email, user.verificationToken);

    return user;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  userSignUp,
  userLogin,
  userLogout,
  getCurrentUser,
  updateUserSubscription,
  updateUserAvatar,
  verificationUserToken,
  resendingVerificationUserToken,
};

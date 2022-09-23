const express = require("express");
const {
  usersValidation,
  updateUserSubscriptionValidation,
  verificationTokenValidation,
} = require("../../middlewares/validationMiddleware");
const {
  verifyTokenMiddleware,
} = require("../../middlewares/verifyTokenMiddleware");
const {
  uploadAvatarMiddleware,
} = require("../../middlewares/uploadAvatarMiddleware");
const { asyncWrapper } = require("../../helpers/apiHelpers");
const {
  userSignUpController,
  userLoginController,
  userLogoutController,
  getCurrentUserController,
  updateSubscriptionController,
  updateAvatarController,
  verificationTokenController,
  resendingVerificationTokenController,
} = require("../../controllers/usersAuthController");

const usersRouter = express.Router();

usersRouter.post(
  "/signup",
  usersValidation,
  asyncWrapper(userSignUpController)
);

usersRouter.post("/login", usersValidation, asyncWrapper(userLoginController));

usersRouter.get(
  "/logout",
  verifyTokenMiddleware,
  asyncWrapper(userLogoutController)
);

usersRouter.get(
  "/current",
  verifyTokenMiddleware,
  asyncWrapper(getCurrentUserController)
);

usersRouter.patch(
  "/",
  updateUserSubscriptionValidation,
  verifyTokenMiddleware,
  asyncWrapper(updateSubscriptionController)
);

usersRouter.patch(
  "/avatars",
  uploadAvatarMiddleware.single("avatar"),
  verifyTokenMiddleware,
  asyncWrapper(updateAvatarController)
);

usersRouter.get(
  "/verify/:verificationToken",
  asyncWrapper(verificationTokenController)
);

usersRouter.post(
  "/verify/",
  verificationTokenValidation,
  asyncWrapper(resendingVerificationTokenController)
);

module.exports = usersRouter;

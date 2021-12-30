const app = require("express");
const router = app.Router();
const {
  register,
  registerValiations,
  login,
  loginValiations,
  emailSend,
  changePassword,
  sendCoinToFriends,
  sendCoinToAdmin,
  showAllUser,
  showUserCoinDebitTransaction,
  showUserCoinCreditTransaction,
} = require("../controllers/userController");
router.post("/register", registerValiations, register);
router.post("/login", loginValiations, login);
router.post("/email-send", emailSend);
router.post("/change-password", changePassword);
router.post("/sendCoinToFriends", sendCoinToFriends);
router.post("/sendCoinToAdmin", sendCoinToAdmin);
router.get("/showAllUser", showAllUser);
router.post("/showUserCoinDebitTransaction", showUserCoinDebitTransaction);
router.post("/showUserCoinCreditTransaction", showUserCoinCreditTransaction);

module.exports = router;

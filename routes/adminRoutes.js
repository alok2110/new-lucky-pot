const app = require("express");
const router = app.Router();
const {
  register,
  login,
  genrateCoinAdmin,
  getGenrateCoinAdmin,
  sendCoinToUser,
  showAdminCoinDebitTransaction,
  showAdminCoinCreditTransaction,
  addResultDeclare,
} = require("../controllers/adminController");
router.post("/registerAdmin", register);
router.post("/loginAdmin", login);
router.post("/genrateCoinAdmin", genrateCoinAdmin);
router.get("/getGenrateCoinAdmin", getGenrateCoinAdmin);
router.post("/sendCoinToUser", sendCoinToUser);

router.post("/showAdminCoinDebitTransaction", showAdminCoinDebitTransaction);
router.post("/showAdminCoinCreditTransaction", showAdminCoinCreditTransaction);

router.post("/addResultDeclare", addResultDeclare);
module.exports = router;

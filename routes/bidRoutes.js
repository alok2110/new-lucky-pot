const app = require("express");
const router = app.Router();
const { placeBid, findWinningNumber } = require("../controllers/BidController");

router.post("/placeBid", placeBid);
router.post("/findWinningNumber", findWinningNumber);

module.exports = router;

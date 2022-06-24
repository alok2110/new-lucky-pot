const app = require("express");
const router = app.Router();
const { placeBid, findWinningNumber, server_sent_timer } = require("../controllers/BidController");

router.post("/placeBid", placeBid);
router.post("/findWinningNumber", findWinningNumber);
router.get("/server-sent-events", server_sent_timer);

module.exports = router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import paymentRouter from "./payment";
import emailsRouter from "./emails";
import webhookRouter from "./webhook";

const router: IRouter = Router();

router.use(healthRouter);
router.use(webhookRouter);
router.use(paymentRouter);
router.use(emailsRouter);

export default router;

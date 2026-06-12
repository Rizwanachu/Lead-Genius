import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import campaignsRouter from "./campaigns";
import outreachRouter from "./outreach";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(campaignsRouter);
router.use(outreachRouter);
router.use(analyticsRouter);

export default router;

import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import auditService from "./service";
const list = asyncHandler(async (req: Request, res: Response) => {
  const { entityType, from, to, page, limit } = req.query as Record<
    string,
    string
  >;
  const result = await auditService.listLogs(req.user!, {
    entityType,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
});

const listPlatform = asyncHandler(async (req: Request, res: Response) => {
  const result = await auditService.listPlatformLogs({ limit: 50 });
  res.json(result);
});
export default { list, listPlatform };

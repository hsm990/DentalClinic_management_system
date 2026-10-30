import { Request, Response } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import documentsService from "./service";
import AppError from "../../common/AppError";
import * as httpsStatus from "../../common/httpStatus";

const list = asyncHandler(async (req: Request, res: Response) => {
  const documents = await documentsService.listDocuments(
    req.user!,
    req.params.patientId as string,
  );
  res.json({ documents });
});

const upload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError("No file uploaded", 422, httpsStatus.ERROR);
  const label = req.body.label || req.file.originalname;
  const document = await documentsService.saveDocument(
    req.user!,
    req.params.patientId as string,
    req.file,
    label,
  );
  res.status(201).json({ document });
});

const getDownloadUrl = asyncHandler(async (req: Request, res: Response) => {
  const result = await documentsService.getSignedDownloadUrl(
    req.user!,
    req.params.id as string,
  );
  res.json(result);
});

const remove = asyncHandler(async (req: Request, res: Response) => {
  await documentsService.deleteDocument(req.user!, req.params.id as string);
  res.status(200).json({ message: "Document deleted" });
});

export default { list, upload, getDownloadUrl, remove };

import prisma from "../../config/prisma";
import AppError from "../../common/AppError";
import cloudinary from "../../config/cloudinary";
import documentsRepository from "./repository";
import * as httpsStatus from "../../common/httpStatus";

interface RequestingUser {
  id: string;
  role: string;
  clinicId: string | null;
}

async function verifyPatientAccess(user: RequestingUser, patientId: string) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId: user.clinicId },
  });
  if (!patient) throw new AppError("Patient not found", 404, httpsStatus.ERROR);
  return patient;
}

async function listDocuments(user: RequestingUser, patientId: string) {
  await verifyPatientAccess(user, patientId);
  return documentsRepository.findByPatient(user.clinicId!, patientId);
}

function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "raw",
) {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        type: "authenticated",
      },
      (error: any, result: any) => {
        if (error || !result) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

async function saveDocument(
  user: RequestingUser,
  patientId: string,
  file: Express.Multer.File,
  label: string,
) {
  await verifyPatientAccess(user, patientId);

  const resourceType = file.mimetype === "application/pdf" ? "raw" : "image";
  const folder = `patient-documents/${user.clinicId}/${patientId}`;

  const result = await uploadBufferToCloudinary(
    file.buffer,
    folder,
    resourceType,
  );

  return documentsRepository.create({
    label,
    fileName: file.originalname,
    cloudinaryId: result.public_id,
    resourceType,
    mimeType: file.mimetype,
    fileSize: file.size,
    patientId,
    clinicId: user.clinicId!,
    uploadedById: user.id,
  });
}

async function getSignedDownloadUrl(user: RequestingUser, id: string) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  const doc = await documentsRepository.findById(user.clinicId, id);
  if (!doc) throw new AppError("Document not found", 404, httpsStatus.ERROR);

  // signed URL, valid for 5 minutes — the clinic-scoping check above is
  // what actually gates access; the short expiry limits how long a leaked
  // link would remain useful
  const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60;

  const url = cloudinary.utils.private_download_url(
    doc.cloudinaryId,
    undefined as any,
    {
      resource_type: doc.resourceType,
      type: "authenticated",
      expires_at: expiresAt,
      attachment: false,
    },
  );

  return { url, fileName: doc.fileName };
}

async function deleteDocument(user: RequestingUser, id: string) {
  if (!user.clinicId)
    throw new AppError(
      "Your account has no clinic assigned",
      422,
      httpsStatus.ERROR,
    );
  const doc = await documentsRepository.findById(user.clinicId, id);
  if (!doc) throw new AppError("Document not found", 404, httpsStatus.ERROR);

  const deleted = await documentsRepository.remove(user.clinicId, id);
  if (!deleted)
    throw new AppError("Document not found", 404, httpsStatus.ERROR);

  // clean up on Cloudinary after the DB row is gone — same "orphaned
  // file over orphaned record" preference as before
  cloudinary.uploader
    .destroy(doc.cloudinaryId, {
      resource_type: doc.resourceType,
      type: "authenticated",
    })
    .catch(() => {});
}

export default {
  listDocuments,
  saveDocument,
  getSignedDownloadUrl,
  deleteDocument,
};

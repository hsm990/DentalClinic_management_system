import { apiSlice } from "@/lib/apiBaseQuery";

export interface PatientDocument {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  uploadedBy?: { id: string; firstName: string; lastName: string } | null;
}

interface DocumentsResponse {
  documents: PatientDocument[];
}
interface DocumentResponse {
  document: PatientDocument;
}

export const documentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<PatientDocument[], string>({
      query: (patientId) => `/patients/${patientId}/documents`,
      transformResponse: (r: DocumentsResponse) => r.documents,
      providesTags: (_r, _e, patientId) => [
        { type: "Document", id: patientId },
      ],
    }),

    uploadDocument: builder.mutation<
      PatientDocument,
      { patientId: string; file: File; label: string }
    >({
      query: ({ patientId, file, label }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("label", label);
        return {
          url: `/patients/${patientId}/documents`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (r: DocumentResponse) => r.document,
      invalidatesTags: (_r, _e, { patientId }) => [
        { type: "Document", id: patientId },
      ],
    }),

    deleteDocument: builder.mutation<void, { id: string; patientId: string }>({
      query: ({ id }) => ({ url: `/documents/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { patientId }) => [
        { type: "Document", id: patientId },
      ],
    }),
    getDownloadUrl: builder.query<{ url: string; fileName: string }, string>({
      query: (documentId) => `/documents/${documentId}/download-url`,
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} = documentsApi;

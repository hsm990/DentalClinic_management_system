import { apiSlice } from "@/lib/apiBaseQuery";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  id: string;
  scheduledAt: string;
  durationMin: number;
  status: AppointmentStatus;
  reason?: string | null;
  notes?: string | null;
  patientId: string;
  dentistId: string;
  patient: { id: string; firstName: string; lastName: string };
  dentist: { id: string; firstName: string; lastName: string };
}

interface AppointmentsListResponse {
  appointments: Appointment[];
}
interface AppointmentResponse {
  appointment: Appointment;
}

export const appointmentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query<Appointment[], void>({
      query: () => "/appointments",
      transformResponse: (r: AppointmentsListResponse) => r.appointments,
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({
                type: "Appointment" as const,
                id: a.id,
              })),
              { type: "Appointment" as const, id: "LIST" },
            ]
          : [{ type: "Appointment" as const, id: "LIST" }],
    }),

    createAppointment: builder.mutation<Appointment, Record<string, unknown>>({
      query: (body) => ({ url: "/appointments", method: "POST", body }),
      transformResponse: (r: AppointmentResponse) => r.appointment,
      invalidatesTags: [{ type: "Appointment", id: "LIST" }],
    }),

    updateAppointmentStatus: builder.mutation<
      Appointment,
      { id: string; status: AppointmentStatus }
    >({
      query: ({ id, status }) => ({
        url: `/appointments/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (r: AppointmentResponse) => r.appointment,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Appointment", id },
        { type: "Appointment", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} = appointmentsApi;

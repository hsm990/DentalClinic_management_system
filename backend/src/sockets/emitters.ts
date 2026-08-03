import sockets from "./index";

function emitAppointmentCheckedIn(clinicId: string, appointment: any) {
  sockets
    .getIO()
    .to(`clinic:${clinicId}`)
    .emit("appointment:checked_in", appointment);
}

function emitAppointmentUpdated(clinicId: string, appointment: any) {
  sockets
    .getIO()
    .to(`clinic:${clinicId}`)
    .emit("appointment:updated", appointment);
}

function emitInvoiceCreated(clinicId: string, invoice: any) {
  sockets
    .getIO()
    .to(`clinic:${clinicId}:frontdesk`)
    .emit("invoice:created", invoice);
}

export default {
  emitAppointmentCheckedIn,
  emitAppointmentUpdated,
  emitInvoiceCreated,
};

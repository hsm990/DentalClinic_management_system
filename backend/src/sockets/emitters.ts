import sockets from "./index";

// src/sockets/emitters.ts
function emitAppointmentCheckedIn(clinicId: string, appointment: any) {
  const server = sockets.getIO();
  if (!server) return; // no socket server running (e.g. tests) — skip silently
  server.to(`clinic:${clinicId}`).emit("appointment:checked_in", appointment);
}

function emitAppointmentUpdated(clinicId: string, appointment: any) {
  const server = sockets.getIO();
  if (!server) return;
  server.to(`clinic:${clinicId}`).emit("appointment:updated", appointment);
}

function emitInvoiceCreated(clinicId: string, invoice: any) {
  const server = sockets.getIO();
  if (!server) return;
  server.to(`clinic:${clinicId}:frontdesk`).emit("invoice:created", invoice);
}

export default {
  emitAppointmentCheckedIn,
  emitAppointmentUpdated,
  emitInvoiceCreated,
};

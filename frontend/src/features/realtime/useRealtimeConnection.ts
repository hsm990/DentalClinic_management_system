import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { apiSlice } from "@/lib/apiBaseQuery";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export function useRealtimeConnection() {
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const dispatch = useAppDispatch();

  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken; // always current, read inside the socket callback below

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(() => tokenRef.current);

    socket.on("appointment:updated", (appointment) => {
      dispatch(
        apiSlice.util.invalidateTags([
          { type: "Appointment", id: appointment.id },
          { type: "Appointment", id: "LIST" },
        ]),
      );
    });

    socket.on("appointment:checked_in", (appointment) => {
      toast.info(`${appointment.patient?.firstName ?? "A patient"} checked in`);
    });

    socket.on("invoice:created", (invoice) => {
      toast.success(`Invoice #${invoice.invoiceNumber} created`);
      dispatch(
        apiSlice.util.invalidateTags([{ type: "Invoice", id: invoice.id }]),
      );
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection failed:", err.message);
    });

    return () => {
      socket.off("appointment:updated");
      socket.off("appointment:checked_in");
      socket.off("invoice:created");
      socket.off("connect_error");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dispatch]);
}

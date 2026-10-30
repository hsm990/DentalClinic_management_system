import { createContext, useContext, useState, type ReactNode } from "react";
import type { AppointmentStatus } from "@/features/appointments/appointmentsApi";
import type { ToothCondition } from "@/features/toothChart/toothChartApi";
import type { PlanItemStatus } from "@/features/treatmentPlans/treatmentPlansApi";

let idCounter = 1;
const nextId = (prefix: string) => `${prefix}-${idCounter++}`;

export interface DemoPatient {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  allergies?: string;
  isActive: boolean;
}

export interface DemoToothEntry {
  toothNumber: number;
  condition: ToothCondition;
  notes?: string;
}

export interface DemoAppointment {
  id: string;
  patientId: string;
  dentistName: string;
  scheduledAt: string;
  status: AppointmentStatus;
  reason?: string;
}

export interface DemoProcedure {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface DemoPlanItem {
  id: string;
  procedureId: string;
  toothNumber: number;
  status: PlanItemStatus;
  estimatedCost: number;
  invoiced: boolean;
}

export interface DemoTreatmentPlan {
  id: string;
  patientId: string;
  title: string;
  items: DemoPlanItem[];
}

export interface DemoInvoice {
  id: string;
  patientId: string;
  invoiceNumber: number;
  items: { procedureName: string; toothNumber?: number; total: number }[];
  payments: { amount: number; method: string; paidAt: string }[];
  total: number;
}

interface DemoState {
  patients: DemoPatient[];
  toothCharts: Record<string, DemoToothEntry[]>; // patientId -> entries
  appointments: DemoAppointment[];
  procedures: DemoProcedure[];
  treatmentPlans: DemoTreatmentPlan[];
  invoices: DemoInvoice[];
}

function seedData(): DemoState {
  const p1 = nextId("patient");
  const p2 = nextId("patient");
  const p3 = nextId("patient");
  const proc1 = nextId("proc");
  const proc2 = nextId("proc");
  const planId = nextId("plan");
  const itemDone = nextId("item");
  const itemOpen = nextId("item");

  const today = new Date();
  const at = (h: number, m = 0) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  return {
    patients: [
      {
        id: p1,
        firstName: "Yasmine",
        lastName: "Cherif",
        phone: "0555 12 34 56",
        email: "yasmine@example.com",
        allergies: "Penicillin",
        isActive: true,
      },
      {
        id: p2,
        firstName: "Amine",
        lastName: "Taleb",
        phone: "0661 22 33 44",
        isActive: true,
      },
      {
        id: p3,
        firstName: "Nour",
        lastName: "Belkacem",
        phone: "0770 98 76 54",
        isActive: true,
      },
    ],
    toothCharts: {
      [p1]: [
        {
          toothNumber: 16,
          condition: "DECAYED",
          notes: "Visible cavity, distal surface",
        },
        { toothNumber: 36, condition: "FILLED" },
      ],
    },
    appointments: [
      {
        id: nextId("appt"),
        patientId: p1,
        dentistName: "Dr. H. Slimani",
        scheduledAt: at(9, 0),
        status: "CHECKED_IN",
        reason: "Check-up",
      },
      {
        id: nextId("appt"),
        patientId: p2,
        dentistName: "Dr. H. Slimani",
        scheduledAt: at(9, 30),
        status: "CONFIRMED",
        reason: "Treatment",
      },
      {
        id: nextId("appt"),
        patientId: p3,
        dentistName: "Dr. S. Benali",
        scheduledAt: at(10, 15),
        status: "SCHEDULED",
        reason: "Consultation",
      },
    ],
    procedures: [
      {
        id: proc1,
        name: "Dental Cleaning",
        price: 3000,
        category: "Preventive",
      },
      {
        id: proc2,
        name: "Composite Filling",
        price: 5500,
        category: "Restorative",
      },
    ],
    treatmentPlans: [
      {
        id: planId,
        patientId: p1,
        title: "Restorative work, tooth 16",
        items: [
          {
            id: itemDone,
            procedureId: proc2,
            toothNumber: 16,
            status: "COMPLETED",
            estimatedCost: 5500,
            invoiced: false,
          },
          {
            id: itemOpen,
            procedureId: proc1,
            toothNumber: 11,
            status: "PLANNED",
            estimatedCost: 3000,
            invoiced: false,
          },
        ],
      },
    ],
    invoices: [],
  };
}

interface DemoContextValue extends DemoState {
  addPatient: (data: Omit<DemoPatient, "id" | "isActive">) => void;
  archivePatient: (id: string) => void;
  upsertTooth: (
    patientId: string,
    toothNumber: number,
    condition: ToothCondition,
    notes?: string,
  ) => void;
  createAppointment: (data: Omit<DemoAppointment, "id" | "status">) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  addPlanItem: (
    planId: string,
    procedureId: string,
    toothNumber: number,
  ) => void;
  updatePlanItemStatus: (
    planId: string,
    itemId: string,
    status: PlanItemStatus,
  ) => void;
  createInvoiceFromItem: (planId: string, itemId: string) => void;
  recordPayment: (invoiceId: string, amount: number, method: string) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(seedData);

  const addPatient: DemoContextValue["addPatient"] = (data) =>
    setState((s) => ({
      ...s,
      patients: [
        ...s.patients,
        { ...data, id: nextId("patient"), isActive: true },
      ],
    }));

  const archivePatient: DemoContextValue["archivePatient"] = (id) =>
    setState((s) => ({
      ...s,
      patients: s.patients.map((p) =>
        p.id === id ? { ...p, isActive: false } : p,
      ),
    }));

  const upsertTooth: DemoContextValue["upsertTooth"] = (
    patientId,
    toothNumber,
    condition,
    notes,
  ) =>
    setState((s) => {
      const existing = s.toothCharts[patientId] ?? [];
      const filtered = existing.filter((e) => e.toothNumber !== toothNumber);
      return {
        ...s,
        toothCharts: {
          ...s.toothCharts,
          [patientId]: [...filtered, { toothNumber, condition, notes }],
        },
      };
    });

  const createAppointment: DemoContextValue["createAppointment"] = (data) =>
    setState((s) => ({
      ...s,
      appointments: [
        ...s.appointments,
        { ...data, id: nextId("appt"), status: "SCHEDULED" },
      ],
    }));

  const updateAppointmentStatus: DemoContextValue["updateAppointmentStatus"] = (
    id,
    status,
  ) =>
    setState((s) => ({
      ...s,
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status } : a,
      ),
    }));

  const addPlanItem: DemoContextValue["addPlanItem"] = (
    planId,
    procedureId,
    toothNumber,
  ) =>
    setState((s) => {
      const procedure = s.procedures.find((p) => p.id === procedureId);
      if (!procedure) return s;
      const item: DemoPlanItem = {
        id: nextId("item"),
        procedureId,
        toothNumber,
        status: "PLANNED",
        estimatedCost: procedure.price,
        invoiced: false,
      };
      return {
        ...s,
        treatmentPlans: s.treatmentPlans.map((p) =>
          p.id === planId ? { ...p, items: [...p.items, item] } : p,
        ),
      };
    });

  const updatePlanItemStatus: DemoContextValue["updatePlanItemStatus"] = (
    planId,
    itemId,
    status,
  ) =>
    setState((s) => ({
      ...s,
      treatmentPlans: s.treatmentPlans.map((p) =>
        p.id === planId
          ? {
              ...p,
              items: p.items.map((i) =>
                i.id === itemId ? { ...i, status } : i,
              ),
            }
          : p,
      ),
    }));

  const createInvoiceFromItem: DemoContextValue["createInvoiceFromItem"] = (
    planId,
    itemId,
  ) =>
    setState((s) => {
      const plan = s.treatmentPlans.find((p) => p.id === planId);
      const item = plan?.items.find((i) => i.id === itemId);
      const procedure = s.procedures.find((p) => p.id === item?.procedureId);
      if (!plan || !item || !procedure) return s;

      const invoice: DemoInvoice = {
        id: nextId("invoice"),
        patientId: plan.patientId,
        invoiceNumber: s.invoices.length + 1,
        items: [
          {
            procedureName: procedure.name,
            toothNumber: item.toothNumber,
            total: item.estimatedCost,
          },
        ],
        payments: [],
        total: item.estimatedCost,
      };

      return {
        ...s,
        invoices: [...s.invoices, invoice],
        treatmentPlans: s.treatmentPlans.map((p) =>
          p.id === planId
            ? {
                ...p,
                items: p.items.map((i) =>
                  i.id === itemId ? { ...i, invoiced: true } : i,
                ),
              }
            : p,
        ),
      };
    });

  const recordPayment: DemoContextValue["recordPayment"] = (
    invoiceId,
    amount,
    method,
  ) =>
    setState((s) => ({
      ...s,
      invoices: s.invoices.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              payments: [
                ...inv.payments,
                { amount, method, paidAt: new Date().toISOString() },
              ],
            }
          : inv,
      ),
    }));

  return (
    <DemoContext.Provider
      value={{
        ...state,
        addPatient,
        archivePatient,
        upsertTooth,
        createAppointment,
        updateAppointmentStatus,
        addPlanItem,
        updatePlanItemStatus,
        createInvoiceFromItem,
        recordPayment,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoData() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemoData must be used within DemoDataProvider");
  return ctx;
}

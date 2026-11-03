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

export interface DemoTask {
  id: string;
  title: string;
  assignee: string;
  done: boolean;
  createdAt: string;
}

export interface DemoStockItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
}

export interface DemoExpense {
  id: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
}

interface DemoState {
  patients: DemoPatient[];
  toothCharts: Record<string, DemoToothEntry[]>; // patientId -> entries
  appointments: DemoAppointment[];
  procedures: DemoProcedure[];
  treatmentPlans: DemoTreatmentPlan[];
  invoices: DemoInvoice[];
  tasks: DemoTask[];
  stockItems: DemoStockItem[];
  expenses: DemoExpense[];
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
  const onDay = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    d.setHours(10, 0, 0, 0);
    return d.toISOString();
  };

  const taskId = nextId("task");
  const stockId = nextId("stock");

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
      {
        id: nextId("appt"),
        patientId: p2,
        dentistName: "Dr. H. Slimani",
        scheduledAt: onDay(2),
        status: "SCHEDULED",
        reason: "Follow-up",
      },
      {
        id: nextId("appt"),
        patientId: p3,
        dentistName: "Dr. S. Benali",
        scheduledAt: onDay(-3),
        status: "COMPLETED",
        reason: "Cleaning",
      },
      {
        id: nextId("appt"),
        patientId: p1,
        dentistName: "Dr. H. Slimani",
        scheduledAt: onDay(4),
        status: "SCHEDULED",
        reason: "Filling",
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
    tasks: [
      {
        id: taskId,
        title: "Call Amine T. to confirm tomorrow's appointment",
        assignee: "Reception",
        done: false,
        createdAt: onDay(0),
      },
      {
        id: nextId("task"),
        title: "Order more composite resin",
        assignee: "Dr. S. Benali",
        done: false,
        createdAt: onDay(-1),
      },
      {
        id: nextId("task"),
        title: "Send invoice reminder to N. Belkacem",
        assignee: "Reception",
        done: true,
        createdAt: onDay(-2),
      },
    ],
    stockItems: [
      {
        id: stockId,
        name: "Composite resin A2",
        quantity: 8,
        minQuantity: 10,
        unit: "syringes",
      },
      {
        id: nextId("stock"),
        name: "Latex gloves (M)",
        quantity: 45,
        minQuantity: 20,
        unit: "boxes",
      },
      {
        id: nextId("stock"),
        name: "Local anesthetic 2%",
        quantity: 12,
        minQuantity: 8,
        unit: "vials",
      },
      {
        id: nextId("stock"),
        name: "Surgical masks",
        quantity: 3,
        minQuantity: 5,
        unit: "boxes",
      },
    ],
    expenses: [
      {
        id: nextId("expense"),
        category: "Rent",
        amount: 80000,
        date: onDay(-10),
        note: "Monthly clinic rent",
      },
      {
        id: nextId("expense"),
        category: "Supplies",
        amount: 23500,
        date: onDay(-4),
        note: "Dental supply order",
      },
    ],
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
  addTask: (title: string, assignee: string) => void;
  toggleTask: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  addStockItem: (
    data: Omit<DemoStockItem, "id">
  ) => void;
  addExpense: (data: Omit<DemoExpense, "id">) => void;
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

  const addTask: DemoContextValue["addTask"] = (title, assignee) =>
    setState((s) => ({
      ...s,
      tasks: [
        {
          id: nextId("task"),
          title,
          assignee,
          done: false,
          createdAt: new Date().toISOString(),
        },
        ...s.tasks,
      ],
    }));

  const toggleTask: DemoContextValue["toggleTask"] = (id) =>
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));

  const adjustStock: DemoContextValue["adjustStock"] = (id, delta) =>
    setState((s) => ({
      ...s,
      stockItems: s.stockItems.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.max(0, i.quantity + delta) }
          : i,
      ),
    }));

  const addStockItem: DemoContextValue["addStockItem"] = (data) =>
    setState((s) => ({
      ...s,
      stockItems: [...s.stockItems, { ...data, id: nextId("stock") }],
    }));

  const addExpense: DemoContextValue["addExpense"] = (data) =>
    setState((s) => ({
      ...s,
      expenses: [...s.expenses, { ...data, id: nextId("expense") }],
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
        addTask,
        toggleTask,
        adjustStock,
        addStockItem,
        addExpense,
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

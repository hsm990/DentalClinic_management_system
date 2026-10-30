import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const APPOINTMENTS = [
  {
    time: "09:00",
    patient: "Yasmine Cherif",
    doctor: "Dr. H. Slimani",
    type: "Check-up",
    status: "Checked in",
  },
  {
    time: "09:30",
    patient: "Amine Taleb",
    doctor: "Dr. H. Slimani",
    type: "Treatment",
    status: "Confirmed",
  },
  {
    time: "10:15",
    patient: "Nour Belkacem",
    doctor: "Dr. S. Benali",
    type: "Consultation",
    status: "Scheduled",
  },
];

const MODULES = [
  {
    number: "01",
    title: "Patient management",
    description:
      "Keep patient information, medical history, appointments, documents, and payments connected in one record.",
  },
  {
    number: "02",
    title: "Appointments",
    description:
      "Manage your day from a live calendar. See availability, appointment status, and each dentist's schedule at a glance.",
  },
  {
    number: "03",
    title: "Clinical records",
    description:
      "Document treatments with FDI tooth charting, clinical notes, and treatment plans built directly into the patient record.",
  },
  {
    number: "04",
    title: "Billing & payments",
    description:
      "Create invoices, record partial payments, print receipts, and keep track of what is actually collected.",
  },
];

const STATS = [
  ["Today's appointments", "18"],
  ["Checked in", "7"],
  ["Pending payments", "4"],
  ["Today's revenue", "48,500 DA"],
];

export function LandingPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#F4F6F3] text-[#13201C]"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <style>{`
        .ff-display {
          font-family: 'Fraunces', serif;
        }

        .ff-mono {
          font-family: 'IBM Plex Mono', monospace;
        }

        @keyframes heroRise {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-in {
          animation: heroRise 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-in {
            animation: none;
          }
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#D7DED8] bg-[#F4F6F3]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="ff-display text-lg font-medium">
            HSL
            <span className="ml-1 text-[#1F5D4C]">Clinic</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-[#55645C] md:flex">
            <a href="#features" className="hover:text-[#13201C]">
              Features
            </a>
            <a href="#workflow" className="hover:text-[#13201C]">
              How it works
            </a>
            <a href="#modules" className="hover:text-[#13201C]">
              Platform
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Sign in
              </Button>
            </Link>
            <Link to="/try">
              <Button
                size="lg"
                variant="outline"
                className="border-[#C8D0CA] bg-white"
              >
                Try it now
              </Button>
            </Link>
            <Link to="/request-demo">
              <Button className="bg-[#1F5D4C] hover:bg-[#1A4F41]">
                Book a demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={loaded ? "hero-in" : "opacity-0"}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D7DED8] bg-white px-3 py-1.5 text-xs text-[#55645C]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1F5D4C]" />
              Dental clinic management platform
            </div>

            <h1 className="ff-display max-w-2xl text-[2.9rem] font-medium leading-[1.05] tracking-tight md:text-[4.25rem]">
              Run your clinic from one simple workspace.
            </h1>

            <p className="mt-6 max-w-xl text-[17px] leading-8 text-[#55645C]">
              Manage patients, appointments, clinical records, treatment plans,
              invoices, and payments without jumping between different tools.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/request-demo">
                <Button
                  size="lg"
                  className="bg-[#1F5D4C] px-6 hover:bg-[#1A4F41]"
                >
                  Book a demo
                </Button>
              </Link>

              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#C8D0CA] bg-white"
                >
                  Sign in
                </Button>
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#6B766F]">
              <span>✓ Patient records</span>
              <span>✓ Scheduling</span>
              <span>✓ Billing</span>
              <span>✓ Clinical charting</span>
            </div>
          </div>

          {/* SaaS dashboard preview */}
          <div
            className={loaded ? "hero-in" : "opacity-0"}
            style={{ animationDelay: "0.12s" }}
          >
            <div className="overflow-hidden rounded-2xl border border-[#CDD5CF] bg-white shadow-[0_20px_60px_rgba(19,32,28,0.08)]">
              {/* Browser / application chrome */}
              <div className="flex items-center justify-between border-b border-[#E8ECE9] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D7DED8]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D7DED8]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D7DED8]" />
                </div>

                <span className="ff-mono text-[10px] text-[#8A948E]">
                  app.hslclinic.com
                </span>

                <div className="w-12" />
              </div>

              <div className="grid min-h-[390px] grid-cols-[150px_1fr]">
                {/* Sidebar */}
                <aside className="hidden border-r border-[#E8ECE9] bg-[#F8F9F8] p-3 sm:block">
                  <div className="mb-7 px-2">
                    <span className="ff-display text-sm font-medium">
                      HSL Clinic
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    {[
                      "Dashboard",
                      "Appointments",
                      "Patients",
                      "Treatment plans",
                      "Invoices",
                      "Payments",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-md px-2.5 py-2 ${
                          index === 0
                            ? "bg-[#E3EBE6] font-medium text-[#1F5D4C]"
                            : "text-[#68746D]"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-[#E2E7E3] pt-4">
                    <div className="px-2 text-[10px] uppercase tracking-wider text-[#8A948E]">
                      Clinic
                    </div>
                    <div className="mt-2 px-2 text-xs text-[#68746D]">
                      Settings
                    </div>
                  </div>
                </aside>

                {/* Dashboard */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#8A948E]">
                        Wednesday, October 3
                      </p>
                      <h3 className="ff-display mt-1 text-xl font-medium">
                        Good morning, Dr. Slimani
                      </h3>
                    </div>

                    <div className="hidden rounded-md border border-[#D7DED8] px-3 py-1.5 text-xs sm:block">
                      + New appointment
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
                    {STATS.map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-[#E5EAE6] bg-[#FBFCFB] p-3"
                      >
                        <p className="text-[9px] leading-3 text-[#7B867F]">
                          {label}
                        </p>
                        <p className="ff-mono mt-2 text-sm font-medium">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Schedule */}
                  <div className="mt-6 rounded-lg border border-[#E5EAE6]">
                    <div className="flex items-center justify-between border-b border-[#E8ECE9] px-4 py-3">
                      <span className="text-xs font-medium">
                        Today's appointments
                      </span>
                      <span className="text-[10px] text-[#7B867F]">
                        View calendar →
                      </span>
                    </div>

                    <div>
                      {APPOINTMENTS.map((appointment) => (
                        <div
                          key={appointment.patient}
                          className="grid grid-cols-[45px_1fr_auto] items-center gap-2 border-b border-[#F0F2F0] px-4 py-3 last:border-0"
                        >
                          <span className="ff-mono text-[10px] text-[#7B867F]">
                            {appointment.time}
                          </span>

                          <div>
                            <p className="text-xs font-medium">
                              {appointment.patient}
                            </p>
                            <p className="mt-0.5 text-[9px] text-[#89938D]">
                              {appointment.type} · {appointment.doctor}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-2 py-1 text-[9px] ${
                              appointment.status === "Checked in"
                                ? "bg-[#1F5D4C] text-white"
                                : "bg-[#EDF1EE] text-[#55645C]"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-[#7B867F]">
              A glimpse of the clinic dashboard
            </p>
          </div>
        </div>
      </section>

      {/* Trust / positioning */}
      <section className="border-y border-[#D7DED8] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-3 md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#7B867F]">
              One platform
            </p>
            <p className="mt-2 text-sm text-[#55645C]">
              Replace scattered spreadsheets, notes, and disconnected tools.
            </p>
          </div>

          <div className="border-l-0 border-[#E1E6E2] md:border-l md:pl-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[#7B867F]">
              Built for dental teams
            </p>
            <p className="mt-2 text-sm text-[#55645C]">
              Designed around the workflow between reception, dentist, and
              patient.
            </p>
          </div>

          <div className="border-l-0 border-[#E1E6E2] md:border-l md:pl-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[#7B867F]">
              Connected data
            </p>
            <p className="mt-2 text-sm text-[#55645C]">
              Clinical activity and financial activity stay connected to the
              same patient record.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="ff-mono text-xs uppercase tracking-wider text-[#1F5D4C]">
              Everything connected
            </p>

            <h2 className="ff-display mt-3 text-3xl font-medium leading-tight md:text-4xl">
              The tools your clinic uses, working together.
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-[#55645C]">
              HSL Clinic brings the operational and clinical side of your
              practice into the same workspace.
            </p>
          </div>

          <div className="mt-16 grid gap-0 border-t border-[#D7DED8] md:grid-cols-2">
            {MODULES.map((module, index) => (
              <div
                key={module.number}
                className={`border-b border-[#D7DED8] py-10 md:px-8 ${
                  index % 2 === 0 ? "md:border-r md:pl-0" : "md:pr-0"
                }`}
              >
                <div className="flex gap-5">
                  <span className="ff-mono text-xs text-[#1F5D4C]">
                    {module.number}
                  </span>

                  <div>
                    <h3 className="ff-display text-xl font-medium">
                      {module.title}
                    </h3>

                    <p className="mt-3 max-w-md text-sm leading-7 text-[#65716A]">
                      {module.description}
                    </p>

                    <button className="mt-5 text-xs font-medium text-[#1F5D4C]">
                      Explore module →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-t border-[#D7DED8]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="ff-mono text-xs uppercase tracking-wider text-[#1F5D4C]">
                One patient journey
              </p>

              <h2 className="ff-display mt-3 text-3xl font-medium leading-tight md:text-4xl">
                From appointment to payment, without losing the thread.
              </h2>

              <p className="mt-5 max-w-md leading-7 text-[#55645C]">
                Every step creates useful information for the next one. The
                front desk does not need to duplicate what the dentist already
                entered.
              </p>
            </div>

            <div className="space-y-0">
              {[
                [
                  "01",
                  "Appointment",
                  "The patient is booked and appears automatically in the clinic calendar.",
                ],
                [
                  "02",
                  "Patient record",
                  "The team opens one record containing history, notes, documents, and previous visits.",
                ],
                [
                  "03",
                  "Treatment",
                  "The dentist updates the tooth chart and creates or updates the treatment plan.",
                ],
                [
                  "04",
                  "Payment",
                  "Completed work can flow into billing while the payment status stays attached to the patient.",
                ],
              ].map(([number, title, body]) => (
                <div
                  key={number}
                  className="grid grid-cols-[45px_1fr] gap-4 border-t border-[#D7DED8] py-6"
                >
                  <span className="ff-mono text-xs text-[#1F5D4C]">
                    {number}
                  </span>

                  <div>
                    <h3 className="font-medium">{title}</h3>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-[#65716A]">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product screenshot section */}
      <section id="modules" className="bg-[#13201C] text-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="ff-mono text-xs uppercase tracking-wider text-[#D9A441]">
                Your clinic, your data
              </p>

              <h2 className="ff-display mt-3 text-3xl font-medium leading-tight md:text-4xl">
                A workspace your team can actually use every day.
              </h2>

              <p className="mt-5 max-w-lg leading-7 text-white/65">
                No complicated interface filled with features nobody uses. Give
                your team the information they need, where they need it.
              </p>

              <div className="mt-8 space-y-4 text-sm text-white/80">
                <div className="flex gap-3">
                  <span className="text-[#D9A441]">✓</span>
                  Role-based access for clinic staff
                </div>

                <div className="flex gap-3">
                  <span className="text-[#D9A441]">✓</span>
                  Centralized patient records
                </div>

                <div className="flex gap-3">
                  <span className="text-[#D9A441]">✓</span>
                  Appointment and billing workflow
                </div>

                <div className="flex gap-3">
                  <span className="text-[#D9A441]">✓</span>
                  Clinic-wide reporting
                </div>
              </div>

              <Link to="/request-demo">
                <Button
                  size="lg"
                  className="mt-8 bg-[#D9A441] text-[#13201C] hover:bg-[#C9962E]"
                >
                  See the platform
                </Button>
              </Link>
            </div>

            {/* Dark dashboard preview */}
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="rounded-lg bg-[#F7F9F7] p-5 text-[#13201C]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#89938D]">
                      Patient profile
                    </p>
                    <h3 className="ff-display mt-1 text-xl">Yasmine Cherif</h3>
                  </div>

                  <span className="rounded-full bg-[#E3EBE6] px-3 py-1 text-[10px] text-[#1F5D4C]">
                    Active patient
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Last visit", "Sep 26, 2026"],
                    ["Next appointment", "Oct 03, 09:00"],
                    ["Balance", "12,000 DA"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-md border border-[#E2E7E3] bg-white p-3"
                    >
                      <p className="text-[9px] text-[#89938D]">{label}</p>
                      <p className="mt-1 text-xs font-medium">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-md border border-[#E2E7E3] bg-white p-4">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium">Treatment plan</span>
                    <span className="text-[10px] text-[#1F5D4C]">3 stages</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      ["01", "Initial examination", "Completed"],
                      ["02", "Dental restoration", "In progress"],
                      ["03", "Follow-up", "Planned"],
                    ].map(([number, title, status]) => (
                      <div
                        key={number}
                        className="flex items-center gap-3 border-t border-[#F0F2F0] pt-3"
                      >
                        <span className="ff-mono text-[9px] text-[#89938D]">
                          {number}
                        </span>

                        <span className="flex-1 text-xs">{title}</span>

                        <span className="text-[9px] text-[#68746D]">
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="ff-mono text-xs uppercase tracking-wider text-[#1F5D4C]">
            Ready when you are
          </p>

          <h2 className="ff-display mt-3 text-3xl font-medium leading-tight md:text-5xl">
            See how HSL Clinic fits your workflow.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-[#65716A]">
            Book a short walkthrough and see how the platform can work around
            your clinic's existing process.
          </p>

          <Link to="/request-demo">
            <Button
              size="lg"
              className="mt-8 bg-[#1F5D4C] px-7 hover:bg-[#1A4F41]"
            >
              Book a demo
            </Button>
          </Link>

          <p className="mt-4 text-xs text-[#89938D]">
            No commitment. We'll walk through the platform with you.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D7DED8] bg-[#F4F6F3]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-[#65716A] md:flex-row">
          <div>
            <span className="ff-display text-[#13201C]">HSL Clinic</span>
            <span className="ml-2">Dental clinic management platform</span>
          </div>

          <div className="flex gap-6">
            <Link to="/login" className="hover:text-[#13201C]">
              Sign in
            </Link>

            <Link to="/request-demo" className="hover:text-[#13201C]">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

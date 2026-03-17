import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Activity, Clock, Dumbbell } from "lucide-react";
import { motion } from "motion/react";
import BodyBuildTab from "./components/BodyBuildTab";
import CalendarWidget from "./components/CalendarWidget";
import ClockWidget from "./components/ClockWidget";
import DiarySection from "./components/DiarySection";
import FitnessTab from "./components/FitnessTab";

const qc = new QueryClient();

function AppContent() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(170deg, oklch(0.94 0.03 230) 0%, oklch(0.97 0.015 240) 50%, oklch(0.96 0.01 250) 100%)",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "oklch(0.99 0.005 220 / 0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid oklch(0.88 0.03 240)",
          boxShadow: "0 1px 12px oklch(0.55 0.22 280 / 0.08)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/uploads/logo-1.png"
              className="w-8 h-8 object-contain rounded-lg"
              alt="Distresso"
            />
            <span
              className="font-display font-bold text-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.28 285), oklch(0.68 0.26 185))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontWeight: 900,
                letterSpacing: "0.05em",
                filter: "drop-shadow(0 1px 4px oklch(0.45 0.28 285 / 0.5))",
              }}
            >
              DISTRESSO
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <Tabs defaultValue="myday">
          <TabsList
            className="w-full grid grid-cols-3 mb-2"
            style={{
              background: "oklch(0.99 0.003 220)",
              border: "1px solid oklch(0.88 0.03 240)",
              boxShadow: "0 2px 8px oklch(0.55 0.22 280 / 0.07)",
            }}
          >
            <TabsTrigger
              data-ocid="nav.myday.tab"
              value="myday"
              className="gap-1 text-xs px-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Day</span>
            </TabsTrigger>
            <TabsTrigger
              data-ocid="nav.fitness.tab"
              value="fitness"
              className="gap-1 text-xs px-1"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fitness</span>
            </TabsTrigger>
            <TabsTrigger
              data-ocid="nav.bodybuild.tab"
              value="bodybuild"
              className="gap-1 text-xs px-1"
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Build</span>
            </TabsTrigger>
          </TabsList>

          {/* ---- MY DAY TAB ---- */}
          <TabsContent value="myday" className="flex flex-col gap-4 mt-4">
            <motion.div
              className="flex items-center gap-2 mb-1"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Clock
                className="w-4 h-4"
                style={{ color: "oklch(0.55 0.22 280)" }}
              />
              <h2
                className="font-display font-bold text-xl"
                style={{ color: "oklch(0.20 0.06 255)" }}
              >
                My Day
              </h2>
            </motion.div>
            <ClockWidget />
            <CalendarWidget />
            <DiarySection />
          </TabsContent>

          {/* ---- FITNESS TAB ---- */}
          <TabsContent value="fitness" className="mt-4">
            <FitnessTab />
          </TabsContent>

          {/* ---- BODYBUILD TAB ---- */}
          <TabsContent value="bodybuild" className="mt-4">
            <BodyBuildTab />
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AppContent />
    </QueryClientProvider>
  );
}

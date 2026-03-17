import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

// ─── Nutrition Analyzer ───────────────────────────────────────────────────────

const FOOD_PRESETS = [
  {
    name: "Mixed Rice Bowl",
    calories: 480,
    protein: 22,
    carbs: 68,
    fat: 12,
    fiber: 5,
    vitamins: "B1, B6, Iron, Zinc",
  },
  {
    name: "Grilled Chicken Breast",
    calories: 310,
    protein: 58,
    carbs: 0,
    fat: 7,
    fiber: 0,
    vitamins: "B3, B6, Selenium, Phosphorus",
  },
  {
    name: "Caesar Salad",
    calories: 220,
    protein: 8,
    carbs: 14,
    fat: 15,
    fiber: 3,
    vitamins: "A, C, K, Folate",
  },
  {
    name: "Protein Shake",
    calories: 190,
    protein: 30,
    carbs: 12,
    fat: 3,
    fiber: 1,
    vitamins: "B12, D, Calcium, Magnesium",
  },
  {
    name: "Oatmeal with Fruits",
    calories: 340,
    protein: 11,
    carbs: 58,
    fat: 6,
    fiber: 8,
    vitamins: "B1, B5, Manganese, Potassium",
  },
];

type NutritionResult = (typeof FOOD_PRESETS)[0];

function NutrientBar({
  label,
  value,
  unit,
  max,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  max: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium" style={{ color: "oklch(0.25 0.08 260)" }}>
          {label}
        </span>
        <span style={{ color }}>
          {value}
          {unit}
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "oklch(0.91 0.03 240)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function NutritionAnalyzer() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const presetIndexRef = useRef(0);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
    setAnalyzing(true);
    setTimeout(() => {
      const idx = presetIndexRef.current % FOOD_PRESETS.length;
      presetIndexRef.current++;
      setResult(FOOD_PRESETS[idx]);
      setAnalyzing(false);
    }, 1800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  const triggerFile = () => fileInputRef.current?.click();

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        data-ocid="nutrition.dropzone"
        className="relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all w-full"
        style={{
          borderColor: "oklch(0.75 0.18 190 / 0.5)",
          background: "oklch(0.97 0.02 200 / 0.5)",
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={triggerFile}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Food preview"
            className="max-h-48 mx-auto rounded-xl object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <div
              className="text-5xl mb-1"
              style={{
                filter: "drop-shadow(0 2px 8px oklch(0.75 0.18 190 / 0.4))",
              }}
            >
              🍽️
            </div>
            <p
              className="font-semibold"
              style={{ color: "oklch(0.35 0.1 260)" }}
            >
              Drop your food photo here
            </p>
            <p className="text-xs" style={{ color: "oklch(0.55 0.05 250)" }}>
              or click to browse
            </p>
          </div>
        )}
      </button>

      <Button
        data-ocid="nutrition.upload_button"
        onClick={triggerFile}
        className="w-full font-semibold"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.75 0.18 190))",
          color: "white",
        }}
      >
        📸 Upload Food Photo & Analyze
      </Button>

      <AnimatePresence mode="wait">
        {analyzing && (
          <motion.div
            key="loading"
            data-ocid="nutrition.loading_state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl p-5 text-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.92 0.05 280 / 0.5), oklch(0.93 0.04 190 / 0.4))",
              border: "1px solid oklch(0.85 0.05 260)",
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <div
                className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: "oklch(0.55 0.22 280)",
                  borderTopColor: "transparent",
                }}
              />
              <span
                className="font-semibold"
                style={{ color: "oklch(0.35 0.12 270)" }}
              >
                Analyzing nutritional content...
              </span>
            </div>
            <p
              className="text-xs mt-1"
              style={{ color: "oklch(0.55 0.05 250)" }}
            >
              AI is scanning your food photo
            </p>
          </motion.div>
        )}

        {result && !analyzing && (
          <motion.div
            key="result"
            data-ocid="nutrition.success_state"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <Card
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.97 0.02 280 / 0.7), oklch(0.97 0.02 190 / 0.6))",
                border: "1px solid oklch(0.85 0.06 260)",
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle
                    className="text-lg font-display"
                    style={{ color: "oklch(0.25 0.08 260)" }}
                  >
                    {result.name}
                  </CardTitle>
                  <Badge
                    style={{
                      background: "oklch(0.55 0.22 280)",
                      color: "white",
                    }}
                  >
                    {result.calories} kcal
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <NutrientBar
                  label="Protein"
                  value={result.protein}
                  unit="g"
                  max={60}
                  color="oklch(0.62 0.2 145)"
                />
                <NutrientBar
                  label="Carbohydrates"
                  value={result.carbs}
                  unit="g"
                  max={100}
                  color="oklch(0.72 0.18 60)"
                />
                <NutrientBar
                  label="Fat"
                  value={result.fat}
                  unit="g"
                  max={40}
                  color="oklch(0.65 0.21 28)"
                />
                <NutrientBar
                  label="Fiber"
                  value={result.fiber}
                  unit="g"
                  max={15}
                  color="oklch(0.75 0.18 190)"
                />
                <div
                  className="rounded-xl p-3 mt-1"
                  style={{
                    background: "oklch(0.94 0.03 190 / 0.5)",
                    border: "1px solid oklch(0.88 0.04 190)",
                  }}
                >
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{ color: "oklch(0.45 0.12 200)" }}
                  >
                    Key Vitamins & Minerals
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.35 0.08 240)" }}
                  >
                    {result.vitamins}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Exercise Library ─────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

const MUSCLE_GROUPS = [
  {
    id: "chest",
    label: "Chest",
    emoji: "💪",
    color: "oklch(0.65 0.21 28)",
    bg: "oklch(0.96 0.03 28)",
    exercises: [
      { name: "Push-Ups", sets: "4 × 15", videoId: "hZPFPLQq8Tg" },
      { name: "Bench Press", sets: "4 × 10", videoId: "_nqoLVplORY" },
      { name: "Chest Dips", sets: "3 × 12", videoId: "dKgkejpTgrY" },
      { name: "Cable Fly", sets: "3 × 15", videoId: "keMZBSQA3vc" },
    ],
  },
  {
    id: "back",
    label: "Back",
    emoji: "🏋️",
    color: "oklch(0.55 0.22 280)",
    bg: "oklch(0.96 0.04 280)",
    exercises: [
      { name: "Pull-Ups", sets: "4 × 8", videoId: "XB_7En-zf_M" },
      { name: "Deadlift", sets: "3 × 6", videoId: "FW2aLAaUWlg" },
      { name: "Bent-Over Row", sets: "4 × 10", videoId: "qFpHaHSmrAQ" },
      { name: "Lat Pulldown", sets: "3 × 12", videoId: "JRF9MoMeRDU" },
    ],
  },
  {
    id: "shoulders",
    label: "Shoulders",
    emoji: "🎯",
    color: "oklch(0.72 0.18 60)",
    bg: "oklch(0.97 0.03 60)",
    exercises: [
      { name: "Overhead Press", sets: "4 × 10", videoId: "GxwhHtxuB-0" },
      { name: "Lateral Raise", sets: "3 × 15", videoId: "oaAMyd1MaYU" },
      { name: "Front Raise", sets: "3 × 12", videoId: "8EcNMcUHOIc" },
      { name: "Arnold Press", sets: "3 × 10", videoId: "K9JrnOuJrYE" },
    ],
  },
  {
    id: "biceps",
    label: "Biceps",
    emoji: "💥",
    color: "oklch(0.62 0.2 145)",
    bg: "oklch(0.96 0.04 145)",
    exercises: [
      { name: "Bicep Curl", sets: "4 × 12", videoId: "ykJmrZ5v0Oo" },
      { name: "Hammer Curl", sets: "3 × 12", videoId: "TwD-YGVP4Bk" },
      { name: "Incline Curl", sets: "3 × 10", videoId: "soxrZlIl35U" },
      { name: "Concentration Curl", sets: "3 × 12", videoId: "Jvj2wV0vOYU" },
    ],
  },
  {
    id: "triceps",
    label: "Triceps",
    emoji: "⚡",
    color: "oklch(0.75 0.18 190)",
    bg: "oklch(0.96 0.04 190)",
    exercises: [
      { name: "Tricep Dips", sets: "4 × 12", videoId: "EL_8EIixz0s" },
      { name: "Skull Crushers", sets: "3 × 12", videoId: "NjRDvQtIbm4" },
      { name: "Overhead Extension", sets: "3 × 12", videoId: "DpWFfHRFnAQ" },
      { name: "Rope Pushdown", sets: "3 × 15", videoId: "kiuVA0gs3EI" },
    ],
  },
  {
    id: "legs",
    label: "Legs",
    emoji: "🦵",
    color: "oklch(0.60 0.20 310)",
    bg: "oklch(0.96 0.03 310)",
    exercises: [
      { name: "Squats", sets: "4 × 12", videoId: "pqY51FEZhMY" },
      { name: "Lunges", sets: "3 × 10 each", videoId: "Z2n58m2i4jg" },
      { name: "Leg Press", sets: "4 × 12", videoId: "IZxyjW7MPJQ" },
      { name: "Calf Raises", sets: "4 × 20", videoId: "gwLzBJYoWlI" },
    ],
  },
  {
    id: "abs",
    label: "Abs",
    emoji: "🔥",
    color: "oklch(0.65 0.21 28)",
    bg: "oklch(0.96 0.03 28)",
    exercises: [
      { name: "Plank", sets: "3 × 60s", videoId: "pSHjTRCQxIw" },
      { name: "Crunches", sets: "4 × 20", videoId: "MKmrqcoCZ-M" },
      { name: "Leg Raises", sets: "3 × 15", videoId: "JB2oyawG9KI" },
      { name: "Russian Twists", sets: "3 × 20", videoId: "U8xMpOkxXtg" },
    ],
  },
  {
    id: "glutes",
    label: "Glutes",
    emoji: "🍑",
    color: "oklch(0.68 0.18 355)",
    bg: "oklch(0.97 0.03 355)",
    exercises: [
      { name: "Hip Thrust", sets: "4 × 12", videoId: "LM8XfHCko84" },
      { name: "Glute Bridge", sets: "4 × 15", videoId: "OzUNRvB-Hj8" },
      { name: "Sumo Squat", sets: "3 × 12", videoId: "qJQyuM3bLEw" },
      { name: "Cable Kickback", sets: "3 × 12", videoId: "CGoOm2XYLVY" },
    ],
  },
  {
    id: "recovery",
    label: "Recovery",
    emoji: "🧘",
    color: "oklch(0.62 0.20 185)",
    bg: "oklch(0.96 0.03 185)",
    exercises: [
      {
        name: "Foam Rolling – Full Body",
        sets: "10 min",
        videoId: "Yn4NcFjdkw0",
      },
      {
        name: "Hip Flexor Stretch",
        sets: "3 × 60s each",
        videoId: "R_GrdaE5VxQ",
      },
      {
        name: "Child's Pose + Thoracic Rotation",
        sets: "3 × 45s",
        videoId: "qTJFc-_5GVs",
      },
      {
        name: "Cat-Cow Spinal Mobility",
        sets: "3 × 15 reps",
        videoId: "kqnua4rHVVA",
      },
      {
        name: "Pigeon Pose – Hip Recovery",
        sets: "2 × 60s each",
        videoId: "TmeZHVkpZ2M",
      },
    ],
  },
  {
    id: "remedies",
    label: "Home Remedies",
    emoji: "🌿",
    color: "oklch(0.58 0.18 145)",
    bg: "oklch(0.96 0.04 145)",
    exercises: [
      {
        name: "Ice Bath / Cold Therapy",
        sets: "10–15 min",
        videoId: "igrHgA1-lq0",
      },
      {
        name: "Turmeric Golden Milk Recipe",
        sets: "Daily",
        videoId: "8BT_-DL5ArM",
      },
      { name: "Epsom Salt Soak", sets: "20 min soak", videoId: "KrZONO-PwIE" },
      {
        name: "Ginger Anti-Inflammation Tea",
        sets: "1–2 cups/day",
        videoId: "xH9aJJCbDME",
      },
      {
        name: "DIY Muscle Rub (Arnica/Peppermint)",
        sets: "Post-workout",
        videoId: "Xt9JFEzUXwk",
      },
    ],
  },
];

function ExerciseLibrary() {
  const [selected, setSelected] = useState<string | null>(null);

  // Pre-populate all video links from defaults
  const defaultLinks: Record<string, string> = {};
  const defaultInputs: Record<string, string> = {};
  for (const g of MUSCLE_GROUPS) {
    for (const ex of g.exercises) {
      defaultLinks[ex.name] = ex.videoId;
      defaultInputs[ex.name] = `https://www.youtube.com/watch?v=${ex.videoId}`;
    }
  }

  const [customLinks, setCustomLinks] =
    useState<Record<string, string>>(defaultLinks);
  const [linkInputs, setLinkInputs] =
    useState<Record<string, string>>(defaultInputs);

  const group = MUSCLE_GROUPS.find((g) => g.id === selected);

  const handleLinkChange = (exName: string, url: string) => {
    setLinkInputs((prev) => ({ ...prev, [exName]: url }));
    const id = extractYouTubeId(url);
    if (id) {
      setCustomLinks((prev) => ({ ...prev, [exName]: id }));
    } else if (!url) {
      setCustomLinks((prev) => {
        const next = { ...prev };
        delete next[exName];
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: "oklch(0.45 0.06 260)" }}>
        Select a muscle group to see exercises and video tutorials
      </p>
      <div className="grid grid-cols-4 gap-2">
        {MUSCLE_GROUPS.map((g) => (
          <motion.button
            key={g.id}
            data-ocid={`exercise.${g.id}.tab`}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelected(selected === g.id ? null : g.id)}
            className="rounded-2xl p-3 flex flex-col items-center gap-1 transition-all"
            style={{
              background: selected === g.id ? g.color : g.bg,
              border: `2px solid ${
                selected === g.id ? g.color : "transparent"
              }`,
              boxShadow:
                selected === g.id
                  ? `0 4px 16px ${g.color}44`
                  : "0 1px 4px oklch(0.5 0.1 260 / 0.1)",
            }}
          >
            <span className="text-2xl">{g.emoji}</span>
            <span
              className="text-xs font-semibold"
              style={{
                color: selected === g.id ? "white" : "oklch(0.25 0.08 260)",
              }}
            >
              {g.label}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {group && (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-4"
          >
            <div
              className="rounded-2xl p-4"
              style={{
                background: `linear-gradient(135deg, ${group.bg}, oklch(0.98 0.01 240))`,
                border: `1px solid ${group.color}33`,
              }}
            >
              <h3
                className="font-display font-bold text-lg mb-3"
                style={{ color: group.color }}
              >
                {group.emoji} {group.label} Exercises
              </h3>
              <div className="flex flex-col gap-5">
                {group.exercises.map((ex) => {
                  const activeVideoId = customLinks[ex.name] ?? ex.videoId;
                  const hasCustom = !!customLinks[ex.name];
                  return (
                    <div
                      key={ex.name}
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: "oklch(0.99 0.004 220 / 0.9)",
                        border: "1px solid oklch(0.90 0.03 240)",
                        boxShadow: "0 2px 8px oklch(0.5 0.1 260 / 0.08)",
                      }}
                    >
                      <div className="flex items-center justify-between px-4 py-3">
                        <span
                          className="font-semibold"
                          style={{ color: "oklch(0.20 0.08 260)" }}
                        >
                          {ex.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {hasCustom && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: "oklch(0.90 0.08 145)",
                                color: "oklch(0.38 0.15 145)",
                              }}
                            >
                              ✅ Custom
                            </span>
                          )}
                          <Badge
                            style={{
                              background: group.bg,
                              color: group.color,
                              border: `1px solid ${group.color}44`,
                            }}
                          >
                            {ex.sets}
                          </Badge>
                        </div>
                      </div>
                      <div className="aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${activeVideoId}`}
                          title={ex.name}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                      {/* Custom video link input */}
                      <div
                        className="px-4 py-3"
                        style={{
                          background: "oklch(0.97 0.02 200 / 0.5)",
                          borderTop: "1px solid oklch(0.92 0.03 240)",
                        }}
                      >
                        <Label
                          className="text-xs mb-1.5 block"
                          style={{ color: "oklch(0.45 0.08 260)" }}
                        >
                          📎 Add your video link (YouTube URL):
                        </Label>
                        <Input
                          data-ocid={`exercise.${ex.name
                            .replace(/\s+/g, "_")
                            .toLowerCase()}.input`}
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={linkInputs[ex.name] ?? ""}
                          onChange={(e) =>
                            handleLinkChange(ex.name, e.target.value)
                          }
                          className="text-xs h-8"
                          style={{
                            borderColor: hasCustom
                              ? "oklch(0.65 0.15 145)"
                              : "oklch(0.85 0.04 260)",
                          }}
                        />
                        {linkInputs[ex.name] && !customLinks[ex.name] && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: "oklch(0.55 0.18 28)" }}
                          >
                            ⚠️ Enter a valid YouTube URL to override the video
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Body Transformation Calculator ──────────────────────────────────────────

type CalcResult = {
  bmi: number;
  dailyCalories: number;
  weeksToGoal: number;
  weeklyPlan: string;
};

function BodyCalculator({
  onResult,
}: {
  onResult: (r: CalcResult, goal: string) => void;
}) {
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [activity, setActivity] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<CalcResult | null>(null);

  const ACTIVITY_MULT: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const calculate = () => {
    const w = Number.parseFloat(weight);
    const t = Number.parseFloat(targetWeight);
    const h = Number.parseFloat(height);
    const a = Number.parseInt(age);
    if (!w || !t || !h || !a || !activity || !goal || !gender) return;

    const bmi = w / ((h / 100) * (h / 100));

    const bmr =
      gender === "female"
        ? 447.593 + 9.247 * w + 3.098 * h - 4.33 * a
        : 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;

    const maintenance = bmr * (ACTIVITY_MULT[activity] ?? 1.55);

    let dailyCalories = maintenance;
    let weeksToGoal = 0;
    let weeklyPlan = "";

    const diff = Math.abs(t - w);

    if (goal === "cut") {
      dailyCalories = maintenance - 500;
      weeksToGoal = Math.ceil(diff / 0.5);
      weeklyPlan =
        gender === "female"
          ? "3 days strength + 2 days cardio (moderate). Focus on preserving lean muscle. Higher carb on training days to support hormones."
          : "3 days strength + 3 days cardio (HIIT). Maintain muscle with heavy lifts, reduce refined carbs, increase protein.";
    } else if (goal === "bulk") {
      dailyCalories = maintenance + 300;
      weeksToGoal = Math.ceil(diff / 0.25);
      weeklyPlan =
        gender === "female"
          ? "4 days strength (full body/upper-lower). Focus on glutes, legs, shoulders. Avoid under-eating — muscle growth requires a calorie surplus."
          : "5 days strength (push/pull/legs). Focus on heavy compound lifts, progressive overload. Prioritize sleep and testosterone-boosting foods.";
    } else {
      dailyCalories = maintenance;
      weeksToGoal = 4;
      weeklyPlan =
        gender === "female"
          ? "4 days mixed training (strength + mobility). Listen to your cycle — lighter training during luteal phase is normal."
          : "4 days balanced (upper/lower split). Consistent progressive overload. Adequate protein and sleep are key.";
    }

    const r: CalcResult = {
      bmi: Math.round(bmi * 10) / 10,
      dailyCalories: Math.round(dailyCalories),
      weeksToGoal,
      weeklyPlan,
    };
    setResult(r);
    onResult(r, goal);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Gender select */}
      <div className="flex flex-col gap-1.5">
        <Label style={{ color: "oklch(0.35 0.08 260)" }}>Gender</Label>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger data-ocid="calculator.gender_select">
            <SelectValue placeholder="Select your gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">♂ Male</SelectItem>
            <SelectItem value="female">♀ Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label style={{ color: "oklch(0.35 0.08 260)" }}>
            Current Weight (kg)
          </Label>
          <Input
            data-ocid="calculator.weight_input"
            type="number"
            placeholder="70"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={{ borderColor: "oklch(0.85 0.04 260)" }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label style={{ color: "oklch(0.35 0.08 260)" }}>
            Target Weight (kg)
          </Label>
          <Input
            data-ocid="calculator.target_input"
            type="number"
            placeholder="80"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            style={{ borderColor: "oklch(0.85 0.04 260)" }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label style={{ color: "oklch(0.35 0.08 260)" }}>Height (cm)</Label>
          <Input
            data-ocid="calculator.height_input"
            type="number"
            placeholder="175"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            style={{ borderColor: "oklch(0.85 0.04 260)" }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label style={{ color: "oklch(0.35 0.08 260)" }}>Age</Label>
          <Input
            data-ocid="calculator.age_input"
            type="number"
            placeholder="25"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{ borderColor: "oklch(0.85 0.04 260)" }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label style={{ color: "oklch(0.35 0.08 260)" }}>Activity Level</Label>
        <Select value={activity} onValueChange={setActivity}>
          <SelectTrigger data-ocid="calculator.activity_select">
            <SelectValue placeholder="Select activity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentary">
              Sedentary (office job, no exercise)
            </SelectItem>
            <SelectItem value="light">Light (1–3 days/week)</SelectItem>
            <SelectItem value="moderate">Moderate (3–5 days/week)</SelectItem>
            <SelectItem value="active">Active (6–7 days/week)</SelectItem>
            <SelectItem value="very_active">
              Very Active (2× day / hard labour)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label style={{ color: "oklch(0.35 0.08 260)" }}>Goal</Label>
        <Select value={goal} onValueChange={setGoal}>
          <SelectTrigger data-ocid="calculator.goal_select">
            <SelectValue placeholder="Select your goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bulk">Build Muscle (Bulk)</SelectItem>
            <SelectItem value="cut">Lose Fat (Cut)</SelectItem>
            <SelectItem value="maintain">Maintain</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        data-ocid="calculator.submit_button"
        onClick={calculate}
        className="w-full font-bold text-base py-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.75 0.18 190))",
          color: "white",
        }}
      >
        🚀 Calculate My Plan
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div
            data-ocid="calculator.success_state"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "BMI",
                  value: result.bmi,
                  unit: "",
                  color: "oklch(0.55 0.22 280)",
                  bg: "oklch(0.95 0.05 280)",
                  icon: "⚖️",
                },
                {
                  label: "Daily Calories",
                  value: result.dailyCalories,
                  unit: " kcal",
                  color: "oklch(0.65 0.21 28)",
                  bg: "oklch(0.96 0.04 28)",
                  icon: "🔥",
                },
                {
                  label: "Est. Weeks",
                  value: result.weeksToGoal,
                  unit: " wks",
                  color: "oklch(0.62 0.2 145)",
                  bg: "oklch(0.95 0.04 145)",
                  icon: "📅",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-3 text-center"
                  style={{
                    background: stat.bg,
                    border: `1px solid ${stat.color}44`,
                  }}
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div
                    className="font-display font-bold text-xl"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                    <span className="text-xs font-normal">{stat.unit}</span>
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.45 0.06 260)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-4"
              style={{
                background: "oklch(0.96 0.03 190 / 0.5)",
                border: "1px solid oklch(0.85 0.05 190)",
              }}
            >
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "oklch(0.45 0.12 200)" }}
              >
                📋 Weekly Training Plan
              </p>
              <p className="text-sm" style={{ color: "oklch(0.28 0.07 250)" }}>
                {result.weeklyPlan}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Diet Recommendations ─────────────────────────────────────────────────────

const DIET_PLANS: Record<
  string,
  {
    protein: number;
    carbs: number;
    fat: number;
    meals: { time: string; foods: string[] }[];
    eat: string[];
    avoid: string[];
    supplements: { name: string; desc: string }[];
  }
> = {
  bulk: {
    protein: 35,
    carbs: 45,
    fat: 20,
    meals: [
      {
        time: "🌅 Breakfast",
        foods: [
          "Boiled eggs x4 + bread toast",
          "Banana + milk",
          "Oats or poha",
        ],
      },
      {
        time: "☀️ Lunch",
        foods: ["Chicken curry + rice (canteen/dhaba)", "Roti + dal", "Curd"],
      },
      {
        time: "🌙 Dinner",
        foods: ["Egg bhurji / chicken + roti", "Dal + rice", "Glass of milk"],
      },
      {
        time: "🥤 Snacks",
        foods: [
          "Boiled eggs x2",
          "Peanut butter bread",
          "Protein shake if budget allows",
        ],
      },
    ],
    eat: [
      "Chicken (available at college dhaba)",
      "Eggs (cheap & accessible)",
      "Rajma, dal, chana for plant protein",
      "Milk, curd, paneer",
      "Roti, rice, oats",
    ],
    avoid: [
      "Alcohol",
      "Processed junk food",
      "Excessive sugar",
      "Trans fats",
      "Skipping meals",
    ],
    supplements: [
      {
        name: "Whey Protein",
        desc: "25–30g post-workout for muscle synthesis",
      },
      { name: "Creatine Monohydrate", desc: "5g/day for strength and power" },
      { name: "Multivitamin", desc: "Fill micronutrient gaps" },
      { name: "Omega-3", desc: "Reduce inflammation, support joint health" },
    ],
  },
  cut: {
    protein: 45,
    carbs: 30,
    fat: 25,
    meals: [
      {
        time: "🌅 Breakfast",
        foods: ["2 boiled eggs + oats with water", "Green tea", "Fruit"],
      },
      {
        time: "☀️ Lunch",
        foods: [
          "Chicken tikka / tandoori (skip gravy)",
          "Salad + dal",
          "Buttermilk",
        ],
      },
      {
        time: "🌙 Dinner",
        foods: ["Egg white bhurji + 1-2 roti", "Light dal + sabzi"],
      },
      {
        time: "🥤 Snacks",
        foods: ["Boiled eggs", "Roasted chana", "Apple or banana"],
      },
    ],
    eat: [
      "High-protein lean meats",
      "Fibrous vegetables (spinach, kale, broccoli)",
      "Low-GI fruits (berries, apples)",
      "Lots of water (3+ litres/day)",
      "Green tea for metabolism boost",
    ],
    avoid: [
      "Sugary beverages",
      "White bread and pasta",
      "Fried foods",
      "High-calorie sauces",
      "Late-night eating",
    ],
    supplements: [
      {
        name: "Whey Protein",
        desc: "Maintain muscle while in calorie deficit",
      },
      { name: "BCAA", desc: "Prevent muscle breakdown during cutting" },
      { name: "L-Carnitine", desc: "Support fat metabolism" },
      {
        name: "Caffeine / Pre-workout",
        desc: "Boost energy for fasted cardio",
      },
    ],
  },
  maintain: {
    protein: 30,
    carbs: 40,
    fat: 30,
    meals: [
      {
        time: "🌅 Breakfast",
        foods: ["Egg toast or poha", "Chai/milk", "Banana"],
      },
      {
        time: "☀️ Lunch",
        foods: ["Chicken or egg curry + rice + roti (mess/dhaba)", "Curd"],
      },
      {
        time: "🌙 Dinner",
        foods: ["Dal chawal or egg + roti", "Seasonal sabzi"],
      },
      {
        time: "🥤 Snacks",
        foods: ["Boiled egg + fruit", "Roasted chana", "Lassi or buttermilk"],
      },
    ],
    eat: [
      "Balanced whole foods",
      "Variety of protein sources",
      "Plenty of vegetables",
      "Whole grains",
      "Hydrate well (2.5L/day)",
    ],
    avoid: [
      "Excessive processed foods",
      "Overeating or undereating",
      "Alcohol in excess",
      "Skipping protein meals",
      "Sedentary lifestyle",
    ],
    supplements: [
      { name: "Whey Protein", desc: "Convenient protein top-up when needed" },
      { name: "Creatine", desc: "Maintain strength performance" },
      { name: "Vitamin D", desc: "Essential for hormones and immunity" },
      { name: "Magnesium", desc: "Improve sleep quality and recovery" },
    ],
  },
};

const VEG_DIET_PLANS: Record<
  string,
  {
    protein: number;
    carbs: number;
    fat: number;
    meals: { time: string; foods: string[] }[];
    eat: string[];
    avoid: string[];
    supplements: { name: string; desc: string }[];
  }
> = {
  bulk: {
    protein: 35,
    carbs: 45,
    fat: 20,
    meals: [
      {
        time: "🌅 Breakfast",
        foods: [
          "Poha or upma",
          "Banana + peanut butter",
          "Full-fat milk or soya milk",
        ],
      },
      {
        time: "☀️ Lunch",
        foods: [
          "Rajma/chole with rice (mess staple)",
          "Roti + paneer sabzi",
          "Curd",
        ],
      },
      {
        time: "🌙 Dinner",
        foods: ["Dal + rice", "Roti + aloo/mix veg sabzi", "Glass of milk"],
      },
      {
        time: "🥤 Snacks",
        foods: [
          "Roasted chana (from canteen)",
          "Peanut chikki",
          "Banana",
          "Plant protein shake if available",
        ],
      },
    ],
    eat: [
      "Rajma, chole, moong dal, masoor dal",
      "Paneer (available in mess)",
      "Roti & rice (mess staple)",
      "Milk, curd, buttermilk",
      "Peanuts, chana, roasted seeds",
    ],
    avoid: [
      "Maida items like white bread & noodles",
      "Oily canteen pakodas daily",
      "Cold drinks & sugary chai",
      "Maggi as main meal",
      "Skipping mess meals",
    ],
    supplements: [
      {
        name: "Plant Protein Powder",
        desc: "25–30g post-workout for muscle synthesis",
      },
      { name: "Creatine", desc: "5g/day for strength and power" },
      { name: "B12 Supplement", desc: "Essential for vegans/vegetarians" },
      { name: "Omega-3 (Algae)", desc: "Plant-based DHA/EPA for inflammation" },
    ],
  },
  cut: {
    protein: 45,
    carbs: 30,
    fat: 25,
    meals: [
      {
        time: "🌅 Breakfast",
        foods: ["Oats with water/milk", "Green tea (canteen)", "Sprouts salad"],
      },
      {
        time: "☀️ Lunch",
        foods: [
          "Dal + sabzi (skip extra rice)",
          "Salad from mess",
          "Buttermilk/chaas",
        ],
      },
      {
        time: "🌙 Dinner",
        foods: ["Light dal + 1-2 roti", "Boiled chana salad", "Curd"],
      },
      {
        time: "🥤 Snacks",
        foods: [
          "Green tea",
          "Roasted chana",
          "Fruit (banana/apple from market)",
        ],
      },
    ],
    eat: [
      "High-fiber vegetables (spinach, kale, broccoli)",
      "Low-GI fruits (berries, apples)",
      "Legumes for protein",
      "Green tea for metabolism",
      "Lots of water (3+ litres/day)",
    ],
    avoid: [
      "Sugary drinks",
      "White bread and pasta",
      "Fried foods",
      "Heavy chutneys/sauces",
      "Late-night eating",
    ],
    supplements: [
      { name: "Plant BCAA", desc: "Prevent muscle breakdown during cutting" },
      { name: "L-Carnitine", desc: "Support fat metabolism" },
      { name: "Green Tea Extract", desc: "Boost metabolism naturally" },
      { name: "B12", desc: "Energy and nerve function support" },
    ],
  },
  maintain: {
    protein: 30,
    carbs: 40,
    fat: 30,
    meals: [
      {
        time: "🌅 Breakfast",
        foods: ["Poha/upma/idli from mess", "Banana", "Milk or chai"],
      },
      {
        time: "☀️ Lunch",
        foods: ["Dal + roti + sabzi (standard mess thali)", "Curd"],
      },
      {
        time: "🌙 Dinner",
        foods: ["Dal rice or roti + sabzi", "Seasonal vegetable"],
      },
      {
        time: "🥤 Snacks",
        foods: ["Roasted chana or makhana", "Fruit", "Lemon water"],
      },
    ],
    eat: [
      "Balanced whole foods",
      "Varied plant proteins",
      "Plenty of vegetables",
      "Dairy or dairy alternatives",
      "Seasonal fruits",
    ],
    avoid: [
      "Ultra-processed foods",
      "Excess oil",
      "Refined sugar",
      "Too much salt",
      "Skipping breakfast",
    ],
    supplements: [
      { name: "Multivitamin", desc: "Fill micronutrient gaps" },
      { name: "B12", desc: "Essential for vegetarians" },
      { name: "Plant Protein", desc: "Top up daily protein intake" },
      { name: "Iron", desc: "Prevent deficiency common in vegetarians" },
    ],
  },
};

function DietRecommendations({ goal }: { goal: string }) {
  const [isVeg, setIsVeg] = useState(true);
  const plan =
    (isVeg ? VEG_DIET_PLANS[goal] : DIET_PLANS[goal]) ??
    (isVeg ? VEG_DIET_PLANS.maintain : DIET_PLANS.maintain);
  const goalLabel =
    goal === "bulk" ? "Build Muscle" : goal === "cut" ? "Lose Fat" : "Maintain";
  const goalColor =
    goal === "bulk"
      ? "oklch(0.55 0.22 280)"
      : goal === "cut"
        ? "oklch(0.65 0.21 28)"
        : "oklch(0.62 0.2 145)";

  return (
    <div data-ocid="diet.section" className="flex flex-col gap-4">
      {/* Veg / Non-Veg Toggle */}
      <div
        className="flex gap-2 p-1 rounded-xl"
        style={{
          background: "oklch(0.93 0.03 240)",
          border: "1px solid oklch(0.86 0.04 250)",
        }}
      >
        <button
          type="button"
          data-ocid="diet.veg.toggle"
          onClick={() => setIsVeg(true)}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          style={
            isVeg
              ? {
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.65 0.20 185))",
                  color: "white",
                  boxShadow: "0 2px 8px oklch(0.55 0.22 280 / 0.35)",
                }
              : { color: "oklch(0.50 0.06 260)" }
          }
        >
          🌱 Vegetarian
        </button>
        <button
          type="button"
          data-ocid="diet.nonveg.toggle"
          onClick={() => setIsVeg(false)}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          style={
            !isVeg
              ? {
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.65 0.20 185))",
                  color: "white",
                  boxShadow: "0 2px 8px oklch(0.55 0.22 280 / 0.35)",
                }
              : { color: "oklch(0.50 0.06 260)" }
          }
        >
          🍗 Non-Vegetarian
        </button>
      </div>

      <div
        className="rounded-2xl p-4"
        style={{
          background: `linear-gradient(135deg, ${goalColor}18, oklch(0.97 0.01 240))`,
          border: `1px solid ${goalColor}33`,
        }}
      >
        <h3
          className="font-display font-bold text-lg mb-1"
          style={{ color: goalColor }}
        >
          {goalLabel} Plan
        </h3>
        <p className="text-xs" style={{ color: "oklch(0.45 0.06 260)" }}>
          Personalized macros and meal plan for your goal
        </p>

        {/* Macro bars */}
        <div className="flex flex-col gap-2 mt-3">
          {[
            {
              label: "Protein",
              pct: plan.protein,
              color: "oklch(0.62 0.2 145)",
            },
            {
              label: "Carbohydrates",
              pct: plan.carbs,
              color: "oklch(0.72 0.18 60)",
            },
            { label: "Fat", pct: plan.fat, color: "oklch(0.65 0.21 28)" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <div
                className="w-20 text-xs font-medium"
                style={{ color: m.color }}
              >
                {m.label}
              </div>
              <div
                className="flex-1 h-3 rounded-full overflow-hidden"
                style={{ background: "oklch(0.91 0.03 240)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: m.color }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${m.pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div
                className="w-10 text-right text-xs font-bold"
                style={{ color: m.color }}
              >
                {m.pct}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Plan */}
      <div className="flex flex-col gap-2">
        <h4
          className="font-display font-semibold text-base"
          style={{ color: "oklch(0.25 0.08 260)" }}
        >
          🍴 Daily Meal Plan
        </h4>
        <div className="grid gap-2">
          {plan.meals.map((meal) => (
            <Card
              key={meal.time}
              data-ocid="diet.meal_plan.card"
              style={{
                background: "oklch(0.99 0.004 220 / 0.9)",
                border: "1px solid oklch(0.89 0.03 240)",
              }}
            >
              <CardContent className="pt-3 pb-3">
                <p
                  className="font-semibold text-sm mb-1.5"
                  style={{ color: goalColor }}
                >
                  {meal.time}
                </p>
                <div className="flex flex-col gap-0.5">
                  {meal.foods.map((food) => (
                    <p
                      key={food}
                      className="text-xs flex items-start gap-1.5"
                      style={{ color: "oklch(0.35 0.06 255)" }}
                    >
                      <span>•</span> {food}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Foods to Eat & Avoid */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-3"
          style={{
            background: "oklch(0.95 0.04 145 / 0.4)",
            border: "1px solid oklch(0.82 0.08 145)",
          }}
        >
          <p
            className="font-semibold text-xs mb-2"
            style={{ color: "oklch(0.45 0.15 145)" }}
          >
            ✅ Foods to Eat
          </p>
          <div className="flex flex-col gap-1">
            {plan.eat.map((f) => (
              <p
                key={f}
                className="text-xs"
                style={{ color: "oklch(0.30 0.08 200)" }}
              >
                • {f}
              </p>
            ))}
          </div>
        </div>
        <div
          className="rounded-2xl p-3"
          style={{
            background: "oklch(0.96 0.04 28 / 0.4)",
            border: "1px solid oklch(0.85 0.08 28)",
          }}
        >
          <p
            className="font-semibold text-xs mb-2"
            style={{ color: "oklch(0.52 0.18 28)" }}
          >
            ❌ Foods to Avoid
          </p>
          <div className="flex flex-col gap-1">
            {plan.avoid.map((f) => (
              <p
                key={f}
                className="text-xs"
                style={{ color: "oklch(0.35 0.08 240)" }}
              >
                • {f}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Supplements */}
      <div>
        <h4
          className="font-display font-semibold text-base mb-2"
          style={{ color: "oklch(0.25 0.08 260)" }}
        >
          💊 Recommended Supplements
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {plan.supplements.map((s, i) => (
            <div
              key={s.name}
              className="rounded-xl p-3"
              style={{
                background:
                  i % 2 === 0
                    ? "oklch(0.95 0.04 280 / 0.4)"
                    : "oklch(0.95 0.04 190 / 0.4)",
                border:
                  i % 2 === 0
                    ? "1px solid oklch(0.84 0.06 280)"
                    : "1px solid oklch(0.84 0.06 190)",
              }}
            >
              <p
                className="font-semibold text-xs mb-0.5"
                style={{
                  color:
                    i % 2 === 0
                      ? "oklch(0.45 0.18 280)"
                      : "oklch(0.42 0.16 190)",
                }}
              >
                {s.name}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.40 0.06 250)" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main BodyBuild Tab ───────────────────────────────────────────────────────

export default function BodyBuildTab() {
  const [calcGoal, setCalcGoal] = useState("maintain");

  return (
    <div className="flex flex-col gap-4">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.40 0.22 280), oklch(0.55 0.20 310), oklch(0.65 0.18 190))",
          boxShadow: "0 8px 32px oklch(0.45 0.22 280 / 0.3)",
        }}
      >
        <div className="relative z-10">
          <h2 className="font-display font-bold text-2xl text-white mb-1">
            💪 BodyBuild Hub
          </h2>
          <p className="text-sm" style={{ color: "oklch(0.92 0.04 220)" }}>
            Nutrition · Exercises · Recovery · Transformation · Diet
          </p>
        </div>
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
          style={{ background: "oklch(0.85 0.12 60)" }}
        />
        <div
          className="absolute right-10 -bottom-6 w-20 h-20 rounded-full opacity-15"
          style={{ background: "oklch(0.90 0.08 190)" }}
        />
      </motion.div>

      {/* Sub-tabs */}
      <Tabs defaultValue="nutrition">
        <TabsList
          className="w-full grid grid-cols-4"
          style={{
            background: "oklch(0.97 0.01 240)",
            border: "1px solid oklch(0.88 0.03 240)",
          }}
        >
          <TabsTrigger
            data-ocid="bodybuild.nutrition.tab"
            value="nutrition"
            className="text-xs"
          >
            🍽️ Nutrition
          </TabsTrigger>
          <TabsTrigger
            data-ocid="bodybuild.exercise.tab"
            value="exercise"
            className="text-xs"
          >
            🏋️ Exercises
          </TabsTrigger>
          <TabsTrigger
            data-ocid="bodybuild.calc.tab"
            value="calc"
            className="text-xs"
          >
            📊 Calculator
          </TabsTrigger>
          <TabsTrigger
            data-ocid="bodybuild.diet.tab"
            value="diet"
            className="text-xs"
          >
            🥗 Diet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nutrition" className="mt-4">
          <NutritionAnalyzer />
        </TabsContent>

        <TabsContent value="exercise" className="mt-4">
          <ExerciseLibrary />
        </TabsContent>

        <TabsContent value="calc" className="mt-4">
          <BodyCalculator onResult={(_r, goal) => setCalcGoal(goal)} />
        </TabsContent>

        <TabsContent value="diet" className="mt-4">
          <DietRecommendations goal={calcGoal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

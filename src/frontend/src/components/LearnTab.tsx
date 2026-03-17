import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  CheckCircle,
  Copy,
  FileText,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// --- Types ---
interface QuizQuestion {
  question: string;
  type: "mcq" | "fill";
  choices?: string[];
  answer: string;
  blankWord?: string;
}

interface QuizAttempt {
  pdfName: string;
  score: number;
  total: number;
  date: string;
}

interface MindMapNode {
  label: string;
  children: string[];
}

// --- PDF.js dynamic load ---
let pdfjsLib: {
  version: string;
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: { data: ArrayBuffer }) => {
    promise: Promise<PDFDocProxy>;
  };
} | null = null;

interface PDFDocProxy {
  numPages: number;
  getPage: (n: number) => Promise<PDFPageProxy>;
}

interface PDFPageProxy {
  getTextContent: () => Promise<{ items: Array<{ str: string }> }>;
}

async function loadPdfJs(): Promise<typeof pdfjsLib> {
  if (pdfjsLib) return pdfjsLib;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const lib = (window as unknown as { pdfjsLib: typeof pdfjsLib }).pdfjsLib;
      if (!lib) return reject(new Error("pdfjs not found"));
      lib!.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      pdfjsLib = lib;
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js"));
    document.head.appendChild(script);
  });
}

async function extractTextFromPDF(file: File): Promise<string> {
  const lib = await loadPdfJs();
  if (!lib) throw new Error("PDF.js not loaded");
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += `${content.items.map((item) => item.str).join(" ")}\n`;
  }
  return text;
}

// --- Text analysis helpers ---
function extractHeadings(text: string): string[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const headings: string[] = [];
  for (const line of lines) {
    if (line.length < 60 && line.length > 3) {
      if (
        line === line.toUpperCase() ||
        /^\d+\.\s/.test(line) ||
        /^(Chapter|Section|Part|Introduction|Conclusion|Summary|Overview)/i.test(
          line,
        )
      ) {
        headings.push(line);
        if (headings.length >= 12) break;
      }
    }
  }
  if (headings.length === 0) {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += 80) {
      const chunk = words.slice(i, i + 80).join(" ");
      const firstSentence = chunk.split(".")[0]?.trim();
      if (firstSentence && firstSentence.length < 60)
        chunks.push(firstSentence);
      if (chunks.length >= 8) break;
    }
    return chunks;
  }
  return headings;
}

function extractKeyTerms(text: string, heading: string): string[] {
  const idx = text.indexOf(heading);
  const section = idx >= 0 ? text.slice(idx, idx + 500) : text.slice(0, 500);
  const words = section
    .split(/\W+/)
    .filter((w) => w.length > 5)
    .filter(
      (w) =>
        !/^(which|there|their|about|would|could|should|these|those|other|where|after)$/i.test(
          w,
        ),
    );
  const freq: Record<string, number> = {};
  for (const w of words) {
    const lw = w.toLowerCase();
    freq[lw] = (freq[lw] ?? 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);
}

function extractNotes(text: string): string[] {
  const sentences = text.replace(/\s+/g, " ").split(/\.(?=\s+[A-Z])/);
  const notes: string[] = [];
  const seen = new Set<string>();
  for (const s of sentences) {
    const trimmed = s.trim();
    if (trimmed.length < 20 || trimmed.length > 250) continue;
    const key = trimmed.slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    if (
      /\d/.test(trimmed) ||
      /^(The |A key|Important|Note that|This|These|In order|One of)/i.test(
        trimmed,
      ) ||
      notes.length < 5
    ) {
      notes.push(`${trimmed}.`);
      if (notes.length >= 15) break;
    }
  }
  return notes;
}

function generateQuestions(text: string): QuizQuestion[] {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/\.(?=\s+[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && s.length < 200);

  const questions: QuizQuestion[] = [];

  const factSentences = sentences.filter(
    (s) => /\d/.test(s) || /is defined as|refers to|means that|is the/i.test(s),
  );

  for (const sent of factSentences.slice(0, 6)) {
    const words = sent.split(/\s+/);
    const keyWordIdx = words.findIndex(
      (w) => w.length > 5 && /[A-Z]/.test(w[0]),
    );
    if (keyWordIdx < 0) continue;
    const keyWord = words[keyWordIdx];
    const distractors = sentences
      .filter((s) => s !== sent)
      .flatMap((s) =>
        s.split(/\s+/).filter((w) => w.length > 5 && /[A-Z]/.test(w[0])),
      )
      .filter((w) => w !== keyWord)
      .slice(0, 3);
    if (distractors.length < 3) continue;
    const choices = [keyWord, ...distractors].sort(() => Math.random() - 0.5);
    questions.push({
      question: `${sent.replace(keyWord, "_______")}?`,
      type: "mcq",
      choices,
      answer: keyWord,
    });
    if (questions.length >= 7) break;
  }

  const blankCandidates = sentences.filter((s) => s.split(/\s+/).length > 8);
  for (const sent of blankCandidates.slice(0, 3)) {
    const words = sent.split(/\s+/);
    const candidates = words.filter((w) => w.length > 5);
    if (candidates.length === 0) continue;
    const blank = candidates[Math.floor(candidates.length / 2)];
    questions.push({
      question: sent.replace(blank, "_______"),
      type: "fill",
      answer: blank,
      blankWord: blank,
    });
    if (questions.filter((q) => q.type === "fill").length >= 3) break;
  }

  return questions.slice(0, 10);
}

// --- Mind Map SVG ---
function MindMapSVG({
  nodes,
  filename,
}: { nodes: MindMapNode[]; filename: string }) {
  const W = 700;
  const H = 500;
  const cx = W / 2;
  const cy = H / 2;
  const R = 160;

  const branchColors = [
    "oklch(0.78 0.19 75)",
    "oklch(0.68 0.18 280)",
    "oklch(0.72 0.18 145)",
    "oklch(0.65 0.21 28)",
    "oklch(0.72 0.2 45)",
    "oklch(0.70 0.18 200)",
  ];

  return (
    <svg
      role="img"
      aria-label={`Mind map for ${filename}`}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full rounded-xl"
      style={{
        background: "oklch(0.15 0.012 55)",
        border: "1px solid oklch(0.25 0.015 55)",
      }}
    >
      <title>Mind map for {filename}</title>
      {/* Central node */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={80}
        ry={36}
        fill="oklch(0.78 0.19 75)"
        opacity={0.9}
      />
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fill="oklch(0.12 0.012 55)"
        fontSize={11}
        fontWeight="bold"
        fontFamily="Bricolage Grotesque, sans-serif"
      >
        {filename.replace(".pdf", "").slice(0, 18)}
      </text>

      {nodes.map((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
        const bx = cx + R * Math.cos(angle);
        const by = cy + R * Math.sin(angle);
        const color = branchColors[i % branchColors.length];
        const nodeKey = `node-${node.label.slice(0, 10)}-${i}`;

        return (
          <g key={nodeKey}>
            <line
              x1={cx}
              y1={cy}
              x2={bx}
              y2={by}
              stroke={color}
              strokeWidth={1.5}
              opacity={0.5}
            />
            <ellipse
              cx={bx}
              cy={by}
              rx={58}
              ry={22}
              fill={color}
              opacity={0.18}
              stroke={color}
              strokeWidth={1}
            />
            <text
              x={bx}
              y={by + 4}
              textAnchor="middle"
              fill={color}
              fontSize={9}
              fontFamily="Figtree, sans-serif"
            >
              {node.label.slice(0, 20)}
            </text>

            {node.children.map((child, j) => {
              const subAngle = angle + ((j - 1) * Math.PI) / 8;
              const subR = 90;
              const sx = bx + subR * Math.cos(subAngle);
              const sy = by + subR * Math.sin(subAngle);
              const childKey = `child-${child.slice(0, 6)}-${j}`;
              return (
                <g key={childKey}>
                  <line
                    x1={bx}
                    y1={by}
                    x2={sx}
                    y2={sy}
                    stroke={color}
                    strokeWidth={1}
                    opacity={0.3}
                    strokeDasharray="3 2"
                  />
                  <circle
                    cx={sx}
                    cy={sy}
                    r={16}
                    fill={color}
                    opacity={0.12}
                    stroke={color}
                    strokeWidth={0.8}
                  />
                  <text
                    x={sx}
                    y={sy + 4}
                    textAnchor="middle"
                    fill={color}
                    fontSize={7}
                    opacity={0.8}
                    fontFamily="Figtree, sans-serif"
                  >
                    {child.slice(0, 10)}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

// --- Main Component ---
export default function LearnTab() {
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mindMapNodes, setMindMapNodes] = useState<MindMapNode[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [fillInput, setFillInput] = useState("");
  const [quizDone, setQuizDone] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const [history, setHistory] = useState<QuizAttempt[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("quizHistory") ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!pdfText) return;
    const headings = extractHeadings(pdfText);
    const nodes: MindMapNode[] = headings.map((h) => ({
      label: h,
      children: extractKeyTerms(pdfText, h),
    }));
    setMindMapNodes(nodes);
    setNotes(extractNotes(pdfText));
    setQuestions(generateQuestions(pdfText));
    setCurrentQ(0);
    setUserAnswers([]);
    setFillInput("");
    setQuizDone(false);
    setQuizStarted(false);
  }, [pdfText]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setPdfName(file.name);
    try {
      const text = await extractTextFromPDF(file);
      setPdfText(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const updated = [...userAnswers, answer];
    setUserAnswers(updated);
    setFillInput("");
    if (updated.length >= questions.length) {
      finishQuiz(updated);
    } else {
      setCurrentQ((q) => q + 1);
    }
  };

  const finishQuiz = (answers: string[]) => {
    setQuizDone(true);
    const score = answers.reduce((acc, ans, i) => {
      const q = questions[i];
      return (
        acc +
        (ans.toLowerCase().trim() === q.answer.toLowerCase().trim() ? 1 : 0)
      );
    }, 0);
    const attempt: QuizAttempt = {
      pdfName,
      score,
      total: questions.length,
      date: new Date().toLocaleDateString(),
    };
    const updated = [attempt, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem("quizHistory", JSON.stringify(updated));
  };

  const retakeQuiz = () => {
    setCurrentQ(0);
    setUserAnswers([]);
    setFillInput("");
    setQuizDone(false);
    setQuizStarted(true);
  };

  const copyNotes = () => {
    navigator.clipboard.writeText(
      notes.map((n, i) => `${i + 1}. ${n}`).join("\n"),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const avgScore =
    history.length > 0
      ? Math.round(
          history.reduce((a, h) => a + (h.score / h.total) * 100, 0) /
            history.length,
        )
      : 0;
  const bestScore =
    history.length > 0
      ? Math.max(...history.map((h) => Math.round((h.score / h.total) * 100)))
      : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5" style={{ color: "oklch(0.78 0.19 75)" }} />
        <h2 className="font-display font-bold text-lg text-foreground">
          PDF Learning Tools
        </h2>
      </div>

      {/* Upload */}
      <div
        className="rounded-2xl p-5 flex flex-col gap-3"
        style={{
          background: "oklch(0.17 0.015 55)",
          border: "1px solid oklch(0.25 0.018 55)",
        }}
      >
        <p className="text-sm text-muted-foreground">
          Upload a PDF to generate a mind map, key notes, quiz, and track your
          progress.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          data-ocid="learn.upload_button"
          className="w-full gap-2"
          style={{
            background: "oklch(0.78 0.19 75)",
            color: "oklch(0.12 0.012 55)",
          }}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          {loading
            ? "Parsing PDF…"
            : pdfText
              ? `${pdfName} (change)`
              : "Upload PDF"}
        </Button>

        {loading && (
          <div data-ocid="learn.loading_state" className="text-center">
            <p className="text-sm text-muted-foreground animate-pulse">
              Extracting text from PDF…
            </p>
          </div>
        )}

        {error && (
          <div
            data-ocid="learn.error_state"
            className="text-sm px-3 py-2 rounded-lg"
            style={{
              background: "oklch(0.58 0.22 25 / 0.15)",
              color: "oklch(0.65 0.21 28)",
            }}
          >
            {error}
          </div>
        )}

        {pdfText && !loading && (
          <div
            className="text-sm px-3 py-2 rounded-lg"
            style={{
              background: "oklch(0.72 0.18 145 / 0.12)",
              color: "oklch(0.72 0.18 145)",
            }}
          >
            ✓ Extracted {pdfText.split(/\s+/).length.toLocaleString()} words
            from {pdfName}
          </div>
        )}
      </div>

      {pdfText && (
        <Tabs defaultValue="mindmap">
          <TabsList
            className="w-full grid grid-cols-4 mb-2"
            style={{
              background: "oklch(0.17 0.015 55)",
              border: "1px solid oklch(0.25 0.018 55)",
            }}
          >
            <TabsTrigger
              data-ocid="learn.mindmap.tab"
              value="mindmap"
              className="text-xs"
            >
              Mind Map
            </TabsTrigger>
            <TabsTrigger
              data-ocid="learn.notes.tab"
              value="notes"
              className="text-xs"
            >
              Notes
            </TabsTrigger>
            <TabsTrigger
              data-ocid="learn.quiz.tab"
              value="quiz"
              className="text-xs"
            >
              Quiz
            </TabsTrigger>
            <TabsTrigger
              data-ocid="learn.progress.tab"
              value="progress"
              className="text-xs"
            >
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mindmap" className="mt-4">
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Visual overview of topics detected in <strong>{pdfName}</strong>
              </p>
              {mindMapNodes.length > 0 ? (
                <MindMapSVG nodes={mindMapNodes} filename={pdfName} />
              ) : (
                <div
                  data-ocid="learn.mindmap.empty_state"
                  className="text-center py-8 text-muted-foreground text-sm"
                >
                  No distinct headings detected — try a structured PDF.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Key points extracted from PDF
                </p>
                <Button
                  data-ocid="learn.notes.button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground"
                  onClick={copyNotes}
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy Notes"}
                </Button>
              </div>
              {notes.length === 0 ? (
                <div
                  data-ocid="learn.notes.empty_state"
                  className="text-center py-8 text-muted-foreground text-sm"
                >
                  No key sentences detected.
                </div>
              ) : (
                <ol className="flex flex-col gap-2">
                  {notes.map((note, i) => (
                    <li
                      key={note.slice(0, 20)}
                      data-ocid={`learn.notes.item.${i + 1}`}
                      className="flex gap-3 p-3 rounded-xl text-sm"
                      style={{
                        background: "oklch(0.17 0.015 55)",
                        border: "1px solid oklch(0.25 0.018 55)",
                      }}
                    >
                      <span
                        className="font-display font-bold text-sm flex-shrink-0"
                        style={{ color: "oklch(0.78 0.19 75)" }}
                      >
                        {i + 1}.
                      </span>
                      <span className="text-foreground leading-relaxed">
                        {note}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="mt-4">
            <div className="flex flex-col gap-4">
              {questions.length === 0 ? (
                <div
                  data-ocid="learn.quiz.empty_state"
                  className="text-center py-8 text-muted-foreground text-sm"
                >
                  Not enough factual content to generate questions.
                </div>
              ) : !quizStarted && !quizDone ? (
                <div className="flex flex-col gap-4 items-center py-6">
                  <div className="text-center">
                    <p className="font-display font-bold text-xl text-foreground">
                      {questions.length} Questions Ready
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Test your knowledge of {pdfName}
                    </p>
                  </div>
                  <Button
                    data-ocid="learn.quiz.primary_button"
                    style={{
                      background: "oklch(0.78 0.19 75)",
                      color: "oklch(0.12 0.012 55)",
                    }}
                    onClick={() => setQuizStarted(true)}
                  >
                    Start Quiz
                  </Button>
                </div>
              ) : quizDone ? (
                <QuizResults
                  questions={questions}
                  userAnswers={userAnswers}
                  onRetake={retakeQuiz}
                />
              ) : (
                <QuizQuestionCard
                  question={questions[currentQ]}
                  index={currentQ}
                  total={questions.length}
                  fillInput={fillInput}
                  setFillInput={setFillInput}
                  onAnswer={handleAnswer}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-4">
            <ProgressPanel
              history={history}
              avgScore={avgScore}
              bestScore={bestScore}
            />
          </TabsContent>
        </Tabs>
      )}

      {!pdfText && (
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{
            background: "oklch(0.17 0.015 55)",
            border: "1px solid oklch(0.25 0.018 55)",
          }}
        >
          <p className="text-sm font-semibold text-foreground">Quiz History</p>
          <ProgressPanel
            history={history}
            avgScore={avgScore}
            bestScore={bestScore}
          />
        </div>
      )}
    </div>
  );
}

// --- Quiz Question Component ---
function QuizQuestionCard({
  question,
  index,
  total,
  fillInput,
  setFillInput,
  onAnswer,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  fillInput: string;
  setFillInput: (v: string) => void;
  onAnswer: (ans: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Question {index + 1} of {total}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: "oklch(0.20 0.015 55)",
            color: "oklch(0.55 0.01 85)",
          }}
        >
          {question.type === "mcq" ? "Multiple Choice" : "Fill in the Blank"}
        </span>
      </div>

      <Progress value={(index / total) * 100} className="h-1.5" />

      <div
        className="p-4 rounded-xl text-sm leading-relaxed text-foreground"
        style={{
          background: "oklch(0.20 0.015 55)",
          border: "1px solid oklch(0.28 0.018 55)",
        }}
      >
        {question.question}
      </div>

      {question.type === "mcq" ? (
        <div className="flex flex-col gap-2">
          {question.choices?.map((choice, i) => (
            <button
              key={choice}
              type="button"
              data-ocid={`learn.quiz.item.${i + 1}`}
              className="text-left p-3 rounded-xl text-sm border transition-all hover:border-primary"
              style={{
                background: "oklch(0.18 0.015 55)",
                borderColor: "oklch(0.28 0.018 55)",
                color: "oklch(0.85 0.01 85)",
              }}
              onClick={() => onAnswer(choice)}
            >
              {String.fromCharCode(65 + i)}. {choice}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            data-ocid="learn.quiz.input"
            type="text"
            value={fillInput}
            onChange={(e) => setFillInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              fillInput.trim() &&
              onAnswer(fillInput.trim())
            }
            placeholder="Type your answer…"
            className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "oklch(0.20 0.015 55)",
              border: "1px solid oklch(0.30 0.018 55)",
              color: "oklch(0.94 0.01 85)",
            }}
          />
          <Button
            data-ocid="learn.quiz.submit_button"
            disabled={!fillInput.trim()}
            style={{
              background: "oklch(0.78 0.19 75)",
              color: "oklch(0.12 0.012 55)",
            }}
            onClick={() => fillInput.trim() && onAnswer(fillInput.trim())}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}

// --- Quiz Results Component ---
function QuizResults({
  questions,
  userAnswers,
  onRetake,
}: {
  questions: QuizQuestion[];
  userAnswers: string[];
  onRetake: () => void;
}) {
  const score = userAnswers.reduce(
    (acc, ans, i) =>
      acc +
      (ans.toLowerCase().trim() === questions[i].answer.toLowerCase().trim()
        ? 1
        : 0),
    0,
  );
  const pct = Math.round((score / questions.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-2xl p-6 text-center flex flex-col gap-2"
        style={{
          background: "oklch(0.17 0.015 55)",
          border: "1px solid oklch(0.25 0.018 55)",
        }}
      >
        <div
          className="font-display font-bold text-5xl"
          style={{
            color: pct >= 70 ? "oklch(0.72 0.18 145)" : "oklch(0.65 0.21 28)",
          }}
        >
          {score}/{questions.length}
        </div>
        <p className="text-muted-foreground text-sm">{pct}% correct</p>
        <p className="text-foreground text-sm font-medium">
          {pct === 100
            ? "Perfect! 🎉"
            : pct >= 70
              ? "Great job! 👏"
              : "Keep studying! 📚"}
        </p>
      </div>

      <Progress value={pct} className="h-2" />

      <div className="flex flex-col gap-2">
        {questions.map((q, i) => {
          const correct =
            userAnswers[i]?.toLowerCase().trim() ===
            q.answer.toLowerCase().trim();
          return (
            <div
              key={q.question.slice(0, 20)}
              data-ocid="learn.quiz.row"
              className="flex gap-3 p-3 rounded-xl text-sm"
              style={{
                background: correct
                  ? "oklch(0.72 0.18 145 / 0.1)"
                  : "oklch(0.65 0.21 28 / 0.1)",
                border: `1px solid ${correct ? "oklch(0.72 0.18 145 / 0.3)" : "oklch(0.65 0.21 28 / 0.3)"}`,
              }}
            >
              {correct ? (
                <CheckCircle
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: "oklch(0.72 0.18 145)" }}
                />
              ) : (
                <XCircle
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: "oklch(0.65 0.21 28)" }}
                />
              )}
              <div>
                <p className="text-foreground">{q.question}</p>
                {!correct && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "oklch(0.72 0.18 145)" }}
                  >
                    Answer: {q.answer}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        data-ocid="learn.quiz.secondary_button"
        variant="outline"
        className="gap-2"
        onClick={onRetake}
      >
        <RefreshCw className="w-4 h-4" /> Retake Quiz
      </Button>
    </div>
  );
}

// --- Progress Panel Component ---
function ProgressPanel({
  history,
  avgScore,
  bestScore,
}: {
  history: QuizAttempt[];
  avgScore: number;
  bestScore: number;
}) {
  const recent = history.slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      {history.length === 0 ? (
        <div
          data-ocid="learn.progress.empty_state"
          className="text-center py-8 text-muted-foreground text-sm"
        >
          No quiz attempts yet. Upload a PDF and take a quiz!
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div
              className="rounded-xl p-3"
              style={{ background: "oklch(0.20 0.015 55)" }}
            >
              <div
                className="font-display font-bold text-xl"
                style={{ color: "oklch(0.78 0.19 75)" }}
              >
                {history.length}
              </div>
              <p className="text-xs text-muted-foreground">attempts</p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{ background: "oklch(0.20 0.015 55)" }}
            >
              <div
                className="font-display font-bold text-xl"
                style={{ color: "oklch(0.72 0.18 145)" }}
              >
                {avgScore}%
              </div>
              <p className="text-xs text-muted-foreground">avg score</p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{ background: "oklch(0.20 0.015 55)" }}
            >
              <div
                className="font-display font-bold text-xl"
                style={{ color: "oklch(0.68 0.18 280)" }}
              >
                {bestScore}%
              </div>
              <p className="text-xs text-muted-foreground">best score</p>
            </div>
          </div>

          <div
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{
              background: "oklch(0.17 0.015 55)",
              border: "1px solid oklch(0.25 0.018 55)",
            }}
          >
            <p className="text-xs font-semibold text-foreground">
              Recent Attempts
            </p>
            <div className="flex items-end gap-1.5 h-20">
              {recent.map((attempt, i) => {
                const pct = Math.round((attempt.score / attempt.total) * 100);
                return (
                  <div
                    key={`${attempt.date}-${i}`}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                    title={`${attempt.pdfName}: ${pct}%`}
                  >
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: `${Math.max(4, pct * 0.72)}px`,
                        background:
                          pct >= 70
                            ? "oklch(0.72 0.18 145)"
                            : pct >= 50
                              ? "oklch(0.78 0.19 75)"
                              : "oklch(0.65 0.21 28)",
                        alignSelf: "flex-end",
                      }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {recent.map((attempt, i) => {
              const pct = Math.round((attempt.score / attempt.total) * 100);
              return (
                <div
                  key={`${attempt.date}-${attempt.pdfName}-${i}`}
                  data-ocid={`learn.progress.item.${i + 1}`}
                  className="flex items-center justify-between p-3 rounded-xl text-sm"
                  style={{
                    background: "oklch(0.17 0.015 55)",
                    border: "1px solid oklch(0.25 0.018 55)",
                  }}
                >
                  <div>
                    <p className="text-foreground text-xs font-medium truncate max-w-[160px]">
                      {attempt.pdfName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {attempt.date}
                    </p>
                  </div>
                  <span
                    className="font-display font-bold text-base"
                    style={{
                      color:
                        pct >= 70
                          ? "oklch(0.72 0.18 145)"
                          : pct >= 50
                            ? "oklch(0.78 0.19 75)"
                            : "oklch(0.65 0.21 28)",
                    }}
                  >
                    {attempt.score}/{attempt.total}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

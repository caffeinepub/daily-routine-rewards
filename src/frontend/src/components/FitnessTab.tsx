import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import L from "leaflet";
import { Activity, MapPin, Minus, Plus, RotateCcw } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";

const STEP_GOAL = 10000;
const CALORIES_PER_STEP = 0.04;
const ACCEL_THRESHOLD = 1.2;
const STEP_COOLDOWN_MS = 300;

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Waypoint {
  lat: number;
  lng: number;
  time: number;
}

interface StepData {
  count: number;
  date: string;
}

// Custom div icons
const startIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const currentIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 0 8px rgba(59,130,246,0.8);animation:pulse 1.5s infinite"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function FitnessTab() {
  const dateStr = getTodayStr();

  // --- Step Counter ---
  const [steps, setSteps] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`stepData_${dateStr}`);
      if (saved) {
        const d: StepData = JSON.parse(saved);
        if (d.date === dateStr) return d.count;
      }
    } catch {}
    return 0;
  });
  const [motionSupported, setMotionSupported] = useState<boolean | null>(null);
  const [motionPermission, setMotionPermission] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const lastStepTime = useRef<number>(0);
  const lastMag = useRef<number>(0);
  const peakDetected = useRef<boolean>(false);

  // Persist steps
  useEffect(() => {
    localStorage.setItem(
      `stepData_${dateStr}`,
      JSON.stringify({ count: steps, date: dateStr }),
    );
  }, [steps, dateStr]);

  // DeviceMotion step detection
  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const mag = Math.sqrt(
      (acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2,
    );
    const delta = mag - lastMag.current;
    lastMag.current = mag;
    const now = Date.now();

    if (!peakDetected.current && delta > ACCEL_THRESHOLD) {
      peakDetected.current = true;
    } else if (peakDetected.current && delta < -ACCEL_THRESHOLD) {
      peakDetected.current = false;
      if (now - lastStepTime.current > STEP_COOLDOWN_MS) {
        lastStepTime.current = now;
        setSteps((s) => s + 1);
      }
    }
  }, []);

  useEffect(() => {
    const hasDME = typeof window.DeviceMotionEvent !== "undefined";
    setMotionSupported(hasDME);
    if (!hasDME) return;

    const needsPermission =
      typeof (
        DeviceMotionEvent as { requestPermission?: () => Promise<string> }
      ).requestPermission === "function";
    if (!needsPermission) {
      setMotionPermission("granted");
      window.addEventListener("devicemotion", handleMotion);
      return () => window.removeEventListener("devicemotion", handleMotion);
    }
  }, [handleMotion]);

  useEffect(() => {
    if (motionPermission === "granted") {
      window.addEventListener("devicemotion", handleMotion);
      return () => window.removeEventListener("devicemotion", handleMotion);
    }
  }, [motionPermission, handleMotion]);

  const requestMotionPermission = async () => {
    try {
      const result = await (
        DeviceMotionEvent as unknown as {
          requestPermission: () => Promise<string>;
        }
      ).requestPermission();
      setMotionPermission(result === "granted" ? "granted" : "denied");
    } catch {
      setMotionPermission("denied");
    }
  };

  const calories = Math.round(steps * CALORIES_PER_STEP);
  const progressPct = Math.min(100, Math.round((steps / STEP_GOAL) * 100));

  // --- GPS Tracker ---
  const [waypoints, setWaypoints] = useState<Waypoint[]>(() => {
    try {
      const saved = localStorage.getItem(`gpsTrack_${dateStr}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [tracking, setTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);

  // Persist waypoints
  useEffect(() => {
    localStorage.setItem(`gpsTrack_${dateStr}`, JSON.stringify(waypoints));
  }, [waypoints, dateStr]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 16,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri",
        maxZoom: 19,
      },
    ).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      polylineRef.current = null;
      startMarkerRef.current = null;
      currentMarkerRef.current = null;
    };
  }, []);

  // Update map when waypoints change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const latLngs: L.LatLngTuple[] = waypoints.map((w) => [w.lat, w.lng]);

    // Update polyline
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latLngs);
    } else if (latLngs.length >= 2) {
      polylineRef.current = L.polyline(latLngs, {
        color: "#f97316",
        weight: 4,
        opacity: 0.85,
      }).addTo(map);
    }

    // Start marker (green)
    if (waypoints.length > 0) {
      const start = waypoints[0];
      if (!startMarkerRef.current) {
        startMarkerRef.current = L.marker([start.lat, start.lng], {
          icon: startIcon,
        }).addTo(map);
      }
    }

    // Current position marker (blue pulsing)
    if (waypoints.length > 0) {
      const last = waypoints[waypoints.length - 1];
      if (currentMarkerRef.current) {
        currentMarkerRef.current.setLatLng([last.lat, last.lng]);
      } else {
        currentMarkerRef.current = L.marker([last.lat, last.lng], {
          icon: currentIcon,
        }).addTo(map);
      }

      // Auto-pan if tracking
      if (tracking) {
        map.panTo([last.lat, last.lng]);
      }
    }
  }, [waypoints, tracking]);

  const startTracking = () => {
    if (!navigator.geolocation) return;
    setTracking(true);

    // Center map on current position first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.setView(
          [pos.coords.latitude, pos.coords.longitude],
          17,
        );
      },
      () => {},
      { enableHighAccuracy: true },
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const wp: Waypoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          time: pos.timestamp,
        };
        setWaypoints((prev) => [...prev, wp]);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  const clearTrack = () => {
    stopTracking();
    setWaypoints([]);
    // Remove map overlays
    polylineRef.current?.remove();
    polylineRef.current = null;
    startMarkerRef.current?.remove();
    startMarkerRef.current = null;
    currentMarkerRef.current?.remove();
    currentMarkerRef.current = null;
  };

  const totalDistance = waypoints.reduce((acc, wp, i) => {
    if (i === 0) return 0;
    const prev = waypoints[i - 1];
    return acc + haversineDistance(prev.lat, prev.lng, wp.lat, wp.lng);
  }, 0);

  const distanceKm = (totalDistance / 1000).toFixed(2);

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col gap-6">
      {/* Step Counter */}
      <div
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.94 0.04 270), oklch(0.96 0.03 200))",
          border: "1px solid oklch(0.88 0.05 260)",
        }}
      >
        <div className="flex items-center gap-2">
          <Activity
            className="w-5 h-5"
            style={{ color: "oklch(0.78 0.19 75)" }}
          />
          <h2 className="font-display font-bold text-lg text-foreground">
            Step Counter
          </h2>
        </div>

        <div className="text-center py-2">
          <div
            className="font-display font-bold text-6xl"
            style={{ color: "oklch(0.78 0.19 75)" }}
          >
            {steps.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">steps today</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progressPct}% of daily goal</span>
            <span>Goal: {STEP_GOAL.toLocaleString()}</span>
          </div>
          <Progress value={progressPct} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-xl p-3 text-center"
            style={{ background: "oklch(0.20 0.015 55)" }}
          >
            <div
              className="font-display font-bold text-xl"
              style={{ color: "oklch(0.72 0.18 145)" }}
            >
              {calories}
            </div>
            <p className="text-xs text-muted-foreground">kcal burned</p>
          </div>
          <div
            className="rounded-xl p-3 text-center"
            style={{ background: "oklch(0.20 0.015 55)" }}
          >
            <div
              className="font-display font-bold text-xl"
              style={{ color: "oklch(0.68 0.18 280)" }}
            >
              {STEP_GOAL - steps > 0
                ? (STEP_GOAL - steps).toLocaleString()
                : "Done! 🎉"}
            </div>
            <p className="text-xs text-muted-foreground">
              {STEP_GOAL - steps > 0 ? "steps to goal" : "goal reached"}
            </p>
          </div>
        </div>

        {motionSupported === false && (
          <div className="flex items-center justify-center gap-3">
            <Button
              data-ocid="fitness.step.secondary_button"
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full"
              onClick={() => setSteps((s) => Math.max(0, s - 1))}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <span className="text-xs text-muted-foreground">Manual count</span>
            <Button
              data-ocid="fitness.step.primary_button"
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full"
              onClick={() => setSteps((s) => s + 1)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        )}

        {motionSupported === true &&
          typeof (
            DeviceMotionEvent as { requestPermission?: () => Promise<string> }
          ).requestPermission === "function" &&
          motionPermission === "pending" && (
            <Button
              data-ocid="fitness.step.button"
              className="w-full"
              onClick={requestMotionPermission}
            >
              Request Motion Permission
            </Button>
          )}

        {motionPermission === "denied" && (
          <p
            className="text-xs text-center"
            style={{ color: "oklch(0.65 0.21 28)" }}
          >
            Motion permission denied. Use manual buttons.
          </p>
        )}

        <Button
          data-ocid="fitness.step.delete_button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground gap-1.5 self-center"
          onClick={() => setSteps(0)}
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset today's steps
        </Button>
      </div>

      {/* GPS Satellite Map */}
      <div
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.94 0.04 270), oklch(0.96 0.03 200))",
          border: "1px solid oklch(0.88 0.05 260)",
        }}
      >
        <div className="flex items-center gap-2">
          <MapPin
            className="w-5 h-5"
            style={{ color: "oklch(0.78 0.19 75)" }}
          />
          <h2 className="font-display font-bold text-lg text-foreground">
            GPS Satellite Map
          </h2>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: "oklch(0.72 0.18 145 / 0.15)",
              color: "oklch(0.55 0.18 145)",
            }}
          >
            Live
          </span>
        </div>

        {/* Leaflet map container */}
        <div
          data-ocid="fitness.canvas_target"
          ref={mapContainerRef}
          className="h-64 w-full rounded-xl overflow-hidden"
          style={{ border: "1px solid oklch(0.25 0.015 55)" }}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div
            className="rounded-xl p-2"
            style={{ background: "oklch(0.20 0.015 55)" }}
          >
            <div
              className="font-display font-bold text-lg"
              style={{ color: "oklch(0.78 0.19 75)" }}
            >
              {distanceKm} km
            </div>
            <p className="text-xs text-muted-foreground">distance</p>
          </div>
          <div
            className="rounded-xl p-2"
            style={{ background: "oklch(0.20 0.015 55)" }}
          >
            <div
              className="font-display font-bold text-lg"
              style={{ color: "oklch(0.78 0.19 75)" }}
            >
              {waypoints.length}
            </div>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
          <div
            className="rounded-xl p-2"
            style={{ background: "oklch(0.20 0.015 55)" }}
          >
            <div
              className="font-display font-bold text-sm"
              style={{ color: "oklch(0.78 0.19 75)" }}
            >
              {waypoints.length > 0
                ? `${formatTime(waypoints[0].time)} – ${formatTime(waypoints[waypoints.length - 1].time)}`
                : "--"}
            </div>
            <p className="text-xs text-muted-foreground">time range</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!tracking ? (
            <Button
              data-ocid="fitness.gps.primary_button"
              className="flex-1 gap-2"
              style={{
                background: "oklch(0.72 0.18 145)",
                color: "oklch(0.99 0.005 220)",
              }}
              onClick={startTracking}
            >
              <MapPin className="w-4 h-4" /> Start Tracking
            </Button>
          ) : (
            <Button
              data-ocid="fitness.gps.secondary_button"
              className="flex-1 gap-2"
              variant="outline"
              style={{
                borderColor: "oklch(0.65 0.21 28)",
                color: "oklch(0.65 0.21 28)",
              }}
              onClick={stopTracking}
            >
              Stop Tracking
            </Button>
          )}
          <Button
            data-ocid="fitness.gps.delete_button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={clearTrack}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {tracking && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{
              background: "oklch(0.72 0.18 145 / 0.12)",
              color: "oklch(0.72 0.18 145)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Tracking your movement on satellite map…
          </div>
        )}
      </div>
    </div>
  );
}

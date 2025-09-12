import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface WeeklyDataRow {
  id: number;
  week: number;
  team_id: number;
  blurb: string;
}

interface Owner {
  id: number; // roster_id
  label: string; // display name
}

const ALL_OWNERS: Owner[] = [
  { id: 8, label: "Teddy Baldassarre" },
  { id: 3, label: "Jonny Chernek" },
  { id: 12, label: "Courtney Chernek" },
  { id: 4, label: "Justin Chicchella" },
  { id: 5, label: "Josh Dasch" },
  { id: 1, label: "Michael Gragg" },
  { id: 7, label: "Brian Havrilla" },
  { id: 10, label: "Aaron Lam" },
  { id: 2, label: "Brian Mullinger" },
  { id: 9, label: "Kevin Mullinger" },
  { id: 6, label: "Bryan Opaskar" },
  { id: 11, label: "Eric Tchen" },
];

export default function Update() {
  const [configs, setConfigs] = useState<WeeklyDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [savingAll, setSavingAll] = useState(false);

  const fetchConfigs = async (week: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("weekly_data")
      .select("*")
      .eq("week", week);

    if (error) {
      console.error("Error fetching weekly data:", error);
      setConfigs([]);
    } else {
      const merged = ALL_OWNERS.map((owner) => {
        const existing = data?.find((d) => Number(d.team_id) === owner.id);
        return {
          id: existing?.id ?? 0,
          week,
          team_id: owner.id,
          blurb: existing?.blurb ?? "",
        };
      });
      setConfigs(merged);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConfigs(selectedWeek);
  }, [selectedWeek]);

  const handleChange = (team_id: number, value: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.team_id === team_id ? { ...c, blurb: value } : c))
    );
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      // Remove old entries for the week
      await supabase.from("weekly_data").delete().eq("week", selectedWeek);

      // Insert all at once
      const { error } = await supabase.from("weekly_data").insert(
        configs.map((c) => ({
          week: c.week,
          team_id: c.team_id,
          blurb: c.blurb,
        }))
      );

      if (error) throw error;

      await fetchConfigs(selectedWeek);
      alert("All teams saved!");
    } catch (err) {
      console.error("Save all failed:", err);
      alert("Save all failed!");
    } finally {
      setSavingAll(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading league data...</div>
      </div>
    );

  return (
    <div className="update-page p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Update Weekly Rankings</h1>

      {/* Week Picker */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Week:</label>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
        >
          {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => (
            <option key={w} value={w}>
              Week {w}
            </option>
          ))}
        </select>
        <button onClick={handleSaveAll} disabled={savingAll}>
          {savingAll ? "Saving..." : "SAVE"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configs.map((team) => {
          const ownerLabel = ALL_OWNERS.find(
            (o) => o.id === team.team_id
          )?.label;
          return (
            <div
              key={team.team_id}
              className="border rounded-lg p-4 shadow-sm bg-[#283142]"
            >
              <h2 className="font-semibold mb-2">{ownerLabel}</h2>
              <textarea
                value={team.blurb}
                onChange={(e) => handleChange(team.team_id, e.target.value)}
                placeholder="Enter weekly blurb..."
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

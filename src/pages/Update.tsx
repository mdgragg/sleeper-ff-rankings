import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface TeamConfig {
  id: number; // DB id, 0 if not yet created
  week: number;
  team_id: string;
  blurb: string;
}

const ALL_TEAMS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

// const ALL_TEAMS = [
//   "michaelGragg",
//   "bmullinger",
//   "jonnychernek",
//   "jcheech30",
//   "jdasch1216",
//   "bopaskar",
//   "brianhavrilla",
//   "TeddyBald",
//   "kevmullinger",
//   "ayayron101",
//   "Teechen",
//   "courtneychernek",
// ];

export default function Update() {
  const [configs, setConfigs] = useState<TeamConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [savingAll, setSavingAll] = useState(false);

  const fetchConfigs = async (week: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("weekly_data")
      .select("*")
      .eq("week", week)
      .order("team_id");

    if (error) {
      console.error("Error fetching configs:", error);
      setConfigs([]);
    } else {
      const merged: TeamConfig[] = ALL_TEAMS.map((team_id) => {
        const existing = data?.find((d) => d.team_id === team_id);
        return {
          id: existing?.id ?? 0,
          week,
          team_id,
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

  const handleChange = (team_id: string, value: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.team_id === team_id ? { ...c, blurb: value } : c))
    );
  };

  const handleSaveSingle = async (team: TeamConfig) => {
    try {
      if (team.id !== 0) {
        const { error: delError } = await supabase
          .from("weekly_data")
          .delete()
          .eq("id", team.id);
        if (delError) {
          console.error("Delete failed:", delError);
          alert("Delete failed!");
          return;
        }
      }

      const { error: insertError } = await supabase
        .from("weekly_data")
        .insert([
          { week: team.week, team_id: team.team_id, blurb: team.blurb },
        ]);

      if (insertError) {
        console.error("Insert failed:", insertError);
        alert("Insert failed!");
      } else {
        fetchConfigs(selectedWeek); // refresh to get the new row ID
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Save failed!");
    }
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    for (const team of configs) {
      await handleSaveSingle(team);
    }
    alert("All teams saved!");
    setSavingAll(false);
  };

  if (loading)
    return (
      <div className="full-screen-loading">
        <div className="loading-bar">
          <div className="loading-bar-progress"></div>
        </div>
        <p>Loading league data...</p>
      </div>
    );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Update Weekly Rankings</h1>

      <label className="block mb-4">
        Select Week:{" "}
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          className="border p-1"
        >
          {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => (
            <option key={w} value={w}>
              Week {w}
            </option>
          ))}
        </select>
      </label>

      {configs.map((team) => (
        <div
          key={team.team_id}
          className="border rounded p-4 mb-4 shadow bg-gray-50"
        >
          <h2 className="font-semibold mb-2">Team {team.team_id}</h2>
          <label className="block mb-2">
            Blurb:
            <input
              type="text"
              value={team.blurb}
              onChange={(e) => handleChange(team.team_id, e.target.value)}
              className="border p-1 ml-2 w-64"
            />
          </label>
          <button
            onClick={() => handleSaveSingle(team)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      ))}

      <button
        onClick={handleSaveAll}
        disabled={savingAll}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
      >
        {savingAll ? "Saving..." : "Save All"}
      </button>
    </div>
  );
}

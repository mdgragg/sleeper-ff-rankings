import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { OwnerWithRanks } from "../types";

interface WeeklyDataRow {
  id: number;
  week: number;
  team_id: number;
  blurb: string;
}

const LEAGUE_ID = import.meta.env.VITE_LEAGUE_ID;

export default function Update() {
  const [owners, setOwners] = useState<OwnerWithRanks[]>([]);
  const [configs, setConfigs] = useState<WeeklyDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [savingAll, setSavingAll] = useState(false);

  // Map Supabase team_id to actual display names
  const teamIdToName: Record<number, string> = {
    1: "Michael Gragg",
    2: "Brien Mullinger",
    3: "Jonny Chernek",
    4: "Justin Chicchella",
    5: "Josh Dasch",
    6: "Bryan Opaskar",
    7: "Brian Havrilla",
    8: "Teddy Baldassarre",
    9: "Kevin Mullinger",
    10: "Aaron Lam",
    11: "Eric Tchen",
    12: "Courtney Chernek",
  };

  // Fetch owners dynamically from Sleeper API
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const rostersRes = await fetch(
          `https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`
        ).then((r) => r.json());

        const usersRes = await fetch(
          `https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`
        ).then((r) => r.json());

        const ownersData: OwnerWithRanks[] = rostersRes.map((roster: any) => {
          const user = usersRes.find((u: any) => u.user_id === roster.owner_id);
          return {
            ownerID: roster.owner_id,
            roster_id: roster.roster_id,
            userName: user?.display_name || "Unknown",
            teamName:
              teamIdToName[roster.roster_id] || user?.display_name || "",
            wins: roster.settings?.wins ?? 0,
            losses: roster.settings?.losses ?? 0,
            pointsFor: parseFloat(`${roster.settings.fpts ?? 0}`),
            pointsAgainst: parseFloat(`${roster.settings.fpts_against ?? 0}`),
            addDropCount: 0,
            TradeCount: 0,
            matchupPoints: 0,
            teamAvatar: user?.metadata?.avatar || "",
          };
        });

        // Sort owners same as Standings component
        const ownersSorted = ownersData.slice().sort((a, b) => {
          if (a.manualRank !== undefined && b.manualRank !== undefined) {
            return a.manualRank - b.manualRank;
          }
          if (a.manualRank !== undefined) return -1;
          if (b.manualRank !== undefined) return 1;

          if (b.wins !== a.wins) return b.wins - a.wins;

          return b.pointsFor - a.pointsFor;
        });

        setOwners(ownersSorted);
      } catch (err) {
        console.error("Failed to fetch owners:", err);
      }
    };

    fetchOwners();
  }, []);

  // Fetch weekly configs from Supabase
  const fetchConfigs = async (week: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("weekly_data")
        .select("*")
        .eq("week", week);

      if (error) {
        console.error("Error fetching weekly data:", error);
        setConfigs([]);
        setLoading(false);
        return;
      }

      // Map Supabase team_id to owner names dynamically
      const merged: WeeklyDataRow[] = owners.map((owner) => {
        const existing = data?.find((d) => d.team_id === owner.roster_id);
        return {
          id: existing?.id ?? 0,
          week,
          team_id: owner.roster_id,
          blurb: existing?.blurb ?? "",
        };
      });

      setConfigs(merged);
    } catch (err) {
      console.error("Failed to fetch configs:", err);
      setConfigs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (owners.length > 0) {
      fetchConfigs(selectedWeek);
    }
  }, [selectedWeek, owners]);

  const handleChange = (team_id: number, value: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.team_id === team_id ? { ...c, blurb: value } : c))
    );
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      await supabase.from("weekly_data").delete().eq("week", selectedWeek);

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
      <div className="full-screen-loading">
        <div className="loading-bar">
          <div className="loading-bar-progress"></div>
        </div>
        <p>Loading league data...</p>
      </div>
    );

  return (
    <div className="update-page p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Update Weekly Rankings</h1>

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
          const ownerLabel = owners.find(
            (o) => o.roster_id === team.team_id
          )?.teamName;

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

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { OwnerWithRanks } from "../types";
import NavDrawer from "../components/NavDrawer";

interface WeeklyDataRow {
  id?: number;
  week: number;
  team_id: number;
  blurb: string;
  gifs?: string;
  manual_rank?: number | null;
}

const LEAGUE_ID = import.meta.env.VITE_LEAGUE_ID;

export default function Update() {
  const [owners, setOwners] = useState<OwnerWithRanks[]>([]);
  const [configs, setConfigs] = useState<WeeklyDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [savingAll, setSavingAll] = useState(false);
  const [draftRanks, setDraftRanks] = useState<Record<number, string>>({});
  const fetchIdRef = useRef(0);

  // Map Supabase team_id to display names
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

  // Fetch owners from Sleeper API
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const [rostersRes, usersRes] = await Promise.all([
          fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`).then(
            (r) => r.json(),
          ),
          fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`).then(
            (r) => r.json(),
          ),
        ]);

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

        // Sort owners (same logic as standings) - this becomes the
        // "Sleeper order" fallback used when a team has no manual_rank
        const ownersSorted = ownersData.slice().sort((a, b) => {
          if (a.manualRank !== undefined && b.manualRank !== undefined)
            return a.manualRank - b.manualRank;
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

  // Sort configs: manual_rank first (ascending), then fall back to
  // each team's original Sleeper-order position for anyone unranked
  const sortConfigs = (list: WeeklyDataRow[], ownerList: OwnerWithRanks[]) => {
    return [...list].sort((a, b) => {
      if (a.manual_rank != null && b.manual_rank != null)
        return a.manual_rank - b.manual_rank;
      if (a.manual_rank != null) return -1;
      if (b.manual_rank != null) return 1;

      const aIdx = ownerList.findIndex((o) => o.roster_id === a.team_id);
      const bIdx = ownerList.findIndex((o) => o.roster_id === b.team_id);
      return aIdx - bIdx;
    });
  };

  // Fetch weekly data from Supabase
  const fetchConfigs = async (week: number) => {
    const requestId = ++fetchIdRef.current;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("weekly_data")
        .select("*")
        .eq("week", week);

      if (error) throw error;

      // A newer fetchConfigs call has started since this one began
      // (e.g. the user switched weeks again) - drop this stale response
      // so it can't overwrite more recent state.
      if (requestId !== fetchIdRef.current) return;

      const merged: WeeklyDataRow[] = owners.map((owner) => {
        const existing = data?.find(
          (d) => Number(d.team_id) === Number(owner.roster_id),
        );
        return {
          id: existing?.id,
          week,
          team_id: owner.roster_id,
          blurb: existing?.blurb ?? "",
          gifs: existing?.gifs ?? "",
          manual_rank: existing?.manual_rank ?? null,
        };
      });

      setConfigs(sortConfigs(merged, owners));
    } catch (err) {
      console.error("Failed to fetch configs:", err);
      if (requestId === fetchIdRef.current) setConfigs([]);
    } finally {
      if (requestId === fetchIdRef.current) setLoading(false);
    }
  };

  // Refetch when week or owners change
  useEffect(() => {
    if (owners.length > 0) {
      fetchConfigs(selectedWeek);
    }
  }, [selectedWeek, owners]);

  const handleChange = (team_id: number, value: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.team_id === team_id ? { ...c, blurb: value } : c)),
    );
  };

  // While typing, just track the raw text - no validation, no blocking,
  // so multi-digit ranks (e.g. "12") can be typed freely even if "1" is
  // momentarily taken by another team.
  const handleRankDraftChange = (team_id: number, value: string) => {
    setDraftRanks((prev) => ({ ...prev, [team_id]: value }));
  };

  // On blur, commit the typed value as a literal slot (1..maxRank).
  // If another team already holds that exact number, it gets bumped down
  // by one (toward rank 1), cascading further only if that slot is also
  // taken. If it can't go down (already at rank 1), it cascades up
  // instead. Either way this always terminates at the target team's own
  // previously-vacated slot (or an unranked gap), so it can never overflow
  // past maxRank or produce a duplicate.
  const commitRank = (team_id: number) => {
    const raw = draftRanks[team_id];

    setDraftRanks((prev) => {
      const next = { ...prev };
      delete next[team_id];
      return next;
    });

    if (raw === undefined) return; // untouched, nothing to commit

    const trimmed = raw.trim();

    if (trimmed === "") {
      setConfigs((prev) => {
        const updated = prev.map((c) =>
          c.team_id === team_id ? { ...c, manual_rank: null } : c,
        );
        return sortConfigs(updated, owners);
      });
      return;
    }

    const requested = Number(trimmed);
    if (!Number.isFinite(requested) || requested < 1) return;

    setConfigs((prev) => {
      const maxRank = owners.length || prev.length;
      const clamped = Math.min(Math.max(Math.round(requested), 1), maxRank);
      const updated = prev.map((c) => ({ ...c }));

      // Ensures `rank` is empty by relocating whoever occupies it further
      // in `direction`, recursively clearing space as needed. Returns
      // false if it runs off the end of the board.
      const freeSlot = (
        rank: number,
        direction: 1 | -1,
        visited: Set<number>,
      ): boolean => {
        if (rank < 1 || rank > maxRank) return false;

        const occupant = updated.find(
          (c) => c.team_id !== team_id && c.manual_rank === rank,
        );
        if (!occupant) return true; // already empty

        if (visited.has(occupant.team_id)) return false; // safety net
        visited.add(occupant.team_id);

        const dest = rank + direction;
        if (!freeSlot(dest, direction, visited)) return false;

        occupant.manual_rank = dest;
        return true;
      };

      let cleared = freeSlot(clamped, -1, new Set([team_id]));
      if (!cleared) cleared = freeSlot(clamped, 1, new Set([team_id]));

      const target = updated.find((c) => c.team_id === team_id);
      if (target) target.manual_rank = clamped;

      return sortConfigs(updated, owners);
    });
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      // Use UPSERT instead of delete+insert
      const { error } = await supabase.from("weekly_data").upsert(
        configs.map((c) => ({
          week: c.week,
          team_id: c.team_id,
          blurb: c.blurb,
          gifs: c.gifs ? [c.gifs] : [],
          manual_rank: c.manual_rank,
        })),
        { onConflict: "team_id,week" },
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

  const handleRevertRanks = async () => {
    if (
      !confirm(
        `Revert all manual rank overrides for ${
          selectedWeek === 0 ? "Preseason" : `Week ${selectedWeek}`
        }? This can't be undone.`,
      )
    )
      return;

    setSavingAll(true);
    try {
      const { error } = await supabase
        .from("weekly_data")
        .update({ manual_rank: null })
        .eq("week", selectedWeek);
      if (error) throw error;
      await fetchConfigs(selectedWeek);
      alert("Reverted to Sleeper ranking!");
    } catch (err) {
      console.error("Revert failed:", err);
      alert("Revert failed!");
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
      <NavDrawer />
      <h1 className="text-2xl font-bold mb-6">Update Weekly Rankings</h1>

      <div className="mb-6 flex items-center gap-4">
        <div>
          <label className="block mb-2 font-medium">Select Week:</label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="rounded px-2 py-1 bg-gray-800 text-white"
          >
            {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={savingAll}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {savingAll ? "Saving..." : "SAVE"}
        </button>

        <button
          onClick={handleRevertRanks}
          disabled={savingAll}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          SLEEPER RANKINGS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configs.map((team) => {
          const ownerLabel = owners.find(
            (o) => o.roster_id === team.team_id,
          )?.teamName;

          return (
            <div
              key={team.team_id}
              className="border rounded-lg p-4 shadow-sm bg-[#283142]"
            >
              <h2 className="font-semibold mb-2">{ownerLabel}</h2>

              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  min={1}
                  max={owners.length || 12}
                  value={
                    draftRanks[team.team_id] ??
                    team.manual_rank?.toString() ??
                    ""
                  }
                  onChange={(e) =>
                    handleRankDraftChange(team.team_id, e.target.value)
                  }
                  onBlur={() => commitRank(team.team_id)}
                  placeholder="Rank"
                  title="Manual rank override"
                  className="rounded bg-gray-900 text-white p-2 rank"
                />
                <input
                  type="text"
                  value={team.gifs || ""}
                  onChange={(e) =>
                    setConfigs((prev) =>
                      prev.map((c) =>
                        c.team_id === team.team_id
                          ? { ...c, gifs: e.target.value }
                          : c,
                      ),
                    )
                  }
                  placeholder="GIF/image link (optional)"
                  className="rounded bg-gray-900 text-white p-2 gifs"
                />
              </div>

              <textarea
                value={team.blurb}
                onChange={(e) => handleChange(team.team_id, e.target.value)}
                placeholder="Enter weekly blurb..."
                className="w-full rounded bg-gray-900 text-white p-2 h-24"
              />
              <hr></hr>
            </div>
          );
        })}
      </div>
    </div>
  );
}

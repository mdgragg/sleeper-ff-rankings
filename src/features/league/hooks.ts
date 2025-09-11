import { useQuery } from "@tanstack/react-query";
import { getJSON } from "../../lib/fetcher";
import { Sleeper } from "./api";

export function useLeague(leagueId: string) {
  return useQuery({
    queryKey: ["league", leagueId],
    queryFn: () => getJSON<any>(Sleeper.league(leagueId)),
    staleTime: 1000 * 60,
  });
}

export function useDraftPicks(draftId?: string) {
  return useQuery({
    queryKey: ["draftPicks", draftId],
    queryFn: () => getJSON<any[]>(Sleeper.draftPicks(draftId!)),
    enabled: !!draftId,
  });
}

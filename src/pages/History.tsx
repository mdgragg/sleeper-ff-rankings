import { useQuery } from "@tanstack/react-query";

interface PastSeason {
  season: string;
  league_id: string;
  name: string;
  [key: string]: any;
}

const leagueId = import.meta.env.VITE_LEAGUE_ID;

const fetchHistory = async (): Promise<PastSeason[]> => {
  const res = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/history`
  );
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
};

export default function History() {
  const {
    data: history,
    isLoading,
    error,
  } = useQuery<PastSeason[]>({
    queryKey: ["history"],
    queryFn: fetchHistory,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading league history</div>;

  return (
    <div>
      <h1>League History</h1>
      {history?.map((season, i) => (
        <div key={i}>
          <p>
            {season.season} – {season.name} (ID: {season.league_id})
          </p>
        </div>
      ))}
    </div>
  );
}

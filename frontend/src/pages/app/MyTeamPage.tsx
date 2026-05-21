import { useEffect, useState } from "react";
import { getMyTeam } from "../../api/teamApi";
import UserCard from "../../components/users/UserCard";
import type { TeamDetail } from "../../types/teamTypes";
import { getToken } from "../../utils/authStorage";

function MyTeamPage() {
  const token = getToken();

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyTeam();
  }, []);

  async function loadMyTeam() {
    if (!token) {
      setError("Sesión no válida.");
      setIsLoading(false);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const data = await getMyTeam(token);
      setTeam(data);
    } catch (apiError) {
      console.error(apiError);
      setTeam(null);
      setError("Todavía no tienes equipo asignado.");
    } finally {
      setIsLoading(false);
    }
  }

  const totalMembers = team ? team.members.length + 1 : 0;
  const totalMembersText =
    totalMembers === 1 ? "1 miembro" : `${totalMembers} miembros`;

  return (
    <section className="app-section my-team-page">
      {isLoading ? (
        <p className="app-muted">Cargando equipo...</p>
      ) : error ? (
        <div className="my-team-empty">
          <h2>Mi equipo</h2>
          <p>{error}</p>
        </div>
      ) : team ? (
        <>
          <header className="my-team-heading">
            <p className="team-card-kicker">Mi equipo</p>
            <h2>{team.name}</h2>
            <p>{totalMembersText}</p>
          </header>

          <div className="team-detail-block">
            <h4>Líder</h4>
            <UserCard user={team.leader} />
          </div>

          <div className="team-detail-block">
            <h4>Miembros</h4>

            {team.members.length === 0 ? (
              <p className="app-muted">
                Este equipo todavía no tiene miembros.
              </p>
            ) : (
              <div className="team-members-list">
                {team.members.map((member) => (
                  <UserCard key={member.userId} user={member} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default MyTeamPage;

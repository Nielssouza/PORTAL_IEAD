import MembersList from "@/components/MembersList";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type MemberRow = {
  id: number;
  name: string;
  email: string;
  cpf: string | null;
  role: "admin" | "member";
  status: "active" | "pending" | "disabled";
  createdAt: string;
  memberType: string | null;
  baptized: number | null;
  hasRole: number | null;
  roleTitle: string | null;
  profession: string | null;
  educationLevel: string | null;
  maritalStatus: string | null;
  birthDate: string | null;
};

async function getMembers(): Promise<MemberRow[]> {
  const db = await getDb();
  const { rows } = await db.query<MemberRow>(
    `
      SELECT
        id,
        name,
        email,
        cpf,
        role,
        status,
        created_at as "createdAt",
        member_type as "memberType",
        baptized,
        has_role as "hasRole",
        role_title as "roleTitle",
        profession,
        education_level as "educationLevel",
        marital_status as "maritalStatus",
        birth_date as "birthDate"
      FROM users
      ORDER BY created_at DESC
    `
  );
  return rows;
}

export default async function MembrosPage() {
  await requireAdmin();
  const members = await getMembers();

  return (
    <main className="page members-page">
      <section className="section">
        <div className="section-head">
          <div>
            <p className="kicker">Membros</p>
            <h1>Cadastros da plataforma</h1>
            <p className="section-text">
              {
                "Aplique filtros para localizar perfis por status, v\u00ednculo, escolaridade ou datas de cadastro."
              }
            </p>
          </div>
          <div className="board-actions">
            <a className="cta ghost" href="/home">
              Voltar para o painel
            </a>
          </div>
        </div>
        <MembersList users={members} />
      </section>
    </main>
  );
}

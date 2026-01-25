import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserByToken } from "@/lib/auth";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

function requireAdmin(request: Request) {
  const token = request.cookies.get("auth_token")?.value;
  const user = getSessionUserByToken(token);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const raffleId = Number(params.id);
  if (!Number.isFinite(raffleId)) {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  const db = getDb();
  const raffle = db
    .prepare(
      `
      SELECT
        id,
        name,
        description,
        draw_date as drawDate,
        sales_deadline as salesDeadline,
        quota_total as quotaTotal,
        status,
        created_at as createdAt
      FROM raffles
      WHERE id = ?
      LIMIT 1
    `
    )
    .get(raffleId) as
    | {
        id: number;
        name: string;
        description: string | null;
        drawDate: string;
        salesDeadline: string;
        quotaTotal: number;
        status: string;
        createdAt: string;
      }
    | undefined;

  if (!raffle) {
    return NextResponse.json({ error: "Ação não encontrada." }, { status: 404 });
  }

  const sales = db
    .prepare(
      `
      SELECT number, buyer, seller, paid, created_at as createdAt
      FROM raffle_sales
      WHERE raffle_id = ?
      ORDER BY number ASC
    `
    )
    .all(raffleId) as Array<{
    number: string;
    buyer: string;
    seller: string;
    paid: number;
    createdAt: string;
  }>;

  const resumoRows = [
    { Campo: "Ação", Valor: raffle.name },
    { Campo: "Descrição", Valor: raffle.description ?? "-" },
    { Campo: "Status", Valor: raffle.status },
    { Campo: "Data do sorteio", Valor: raffle.drawDate },
    { Campo: "Prazo de compras", Valor: raffle.salesDeadline },
    { Campo: "Total de quotas", Valor: raffle.quotaTotal },
  ];

  const vendasRows = sales.map((sale) => ({
    Número: sale.number,
    Comprador: sale.buyer,
    Vendedor: sale.seller,
    Pagamento: sale.paid ? "Pago" : "Pendente",
    "Data de registro": new Date(sale.createdAt).toLocaleString("pt-BR"),
  }));

  const workbook = XLSX.utils.book_new();
  const resumoSheet = XLSX.utils.json_to_sheet(resumoRows);
  const vendasSheet = XLSX.utils.json_to_sheet(vendasRows.length > 0 ? vendasRows : [{ Número: "-", Comprador: "-", Vendedor: "-", Pagamento: "-", "Data de registro": "-" }]);

  XLSX.utils.book_append_sheet(workbook, resumoSheet, "Resumo");
  XLSX.utils.book_append_sheet(workbook, vendasSheet, "Vendas");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const filename = `sorteio-${raffle.id}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
    },
  });
}

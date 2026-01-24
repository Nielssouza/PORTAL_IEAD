import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

const MESSAGES = {
  required: "Preencha todos os campos obrigat\u00f3rios.",
  emailInvalid: "E-mail inv\u00e1lido.",
  cpfInvalid: "CPF inv\u00e1lido.",
  fatherCpfInvalid: "CPF do pai inv\u00e1lido.",
  motherCpfInvalid: "CPF da m\u00e3e inv\u00e1lido.",
  educationInvalid: "Grau de escolaridade inv\u00e1lido.",
  maritalInvalid: "Estado civil inv\u00e1lido.",
  memberTypeInvalid: "Tipo de v\u00ednculo inv\u00e1lido.",
  hasRoleRequired: "Informe se possui cargo.",
  roleTitleRequired: "Informe o cargo.",
  baptizedRequired: "Informe se \u00e9 batizado.",
  baptismDateInvalid: "Data do batismo inv\u00e1lida.",
  baptismDateFuture: "A data do batismo n\u00e3o pode ser futura.",
  birthDateInvalid: "Data de nascimento inv\u00e1lida.",
  birthDateFuture: "A data de nascimento n\u00e3o pode ser futura.",
  birthDateRange: "Informe uma data de nascimento v\u00e1lida.",
  weakPassword:
    "A senha precisa ter no m\u00ednimo 8 caracteres, com letra mai\u00fascula, min\u00fascula, n\u00famero e s\u00edmbolo.",
  duplicateBase: "J\u00e1 existe um cadastro com este e-mail ou CPF.",
  duplicatePending:
    "J\u00e1 existe um cadastro pendente com este e-mail ou CPF. Aguarde a efetiva\u00e7\u00e3o.",
  duplicateActive: "J\u00e1 existe um cadastro ativo com este e-mail ou CPF.",
  duplicateDisabled:
    "H\u00e1 um cadastro bloqueado com este e-mail ou CPF. Procure a secretaria.",
  success:
    "Cadastro enviado com sucesso. Aguarde a efetiva\u00e7\u00e3o do cadastro para acessar o portal.",
};

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

function isValidCpf(value: string) {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i);
  }
  check = (sum * 10) % 11;
  if (check === 10) check = 0;

  return check === Number(cpf[10]);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value: string) {
  if (value.length < 8) return false;
  if (!/[a-z]/.test(value)) return false;
  if (!/[A-Z]/.test(value)) return false;
  if (!/\d/.test(value)) return false;
  if (!/[^\w\s]/.test(value)) return false;
  return true;
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function calcAge(date: Date) {
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }
  return age;
}

const EDUCATION_LEVELS = new Set([
  "fundamental_incompleto",
  "fundamental_completo",
  "medio_incompleto",
  "medio_completo",
  "tecnico",
  "superior_incompleto",
  "superior_completo",
  "pos_graduacao",
  "outro",
]);

const MARITAL_STATUS = new Set([
  "solteiro",
  "casado",
  "divorciado",
  "viuvo",
  "uniao_estavel",
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const cpf = normalizeCpf(String(body.cpf ?? ""));
  const fatherName = String(body.fatherName ?? "").trim();
  const fatherCpf = normalizeCpf(String(body.fatherCpf ?? ""));
  const motherName = String(body.motherName ?? "").trim();
  const motherCpf = normalizeCpf(String(body.motherCpf ?? ""));
  const birthDateRaw = String(body.birthDate ?? "").trim();
  const memberType = String(body.memberType ?? "").trim();
  const hasRoleRaw = String(body.hasRole ?? "").trim();
  const roleTitle = String(body.roleTitle ?? "").trim();
  const baptizedRaw = String(body.baptized ?? "").trim();
  const baptismDateRaw = String(body.baptismDate ?? "").trim();
  const profession = String(body.profession ?? "").trim();
  const educationLevel = String(body.educationLevel ?? "").trim();
  const maritalStatus = String(body.maritalStatus ?? "").trim();
  const address = String(body.address ?? "").trim();
  const password = String(body.password ?? "");

  const db = getDb();

  if (
    !name ||
    !email ||
    !cpf ||
    !fatherName ||
    !fatherCpf ||
    !motherName ||
    !motherCpf ||
    !birthDateRaw ||
    !memberType ||
    !profession ||
    !educationLevel ||
    !maritalStatus ||
    !password ||
    !address
  ) {
    return NextResponse.json({ error: MESSAGES.required }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: MESSAGES.emailInvalid }, { status: 400 });
  }

  if (!isValidCpf(cpf)) {
    return NextResponse.json({ error: MESSAGES.cpfInvalid }, { status: 400 });
  }

  if (!isValidCpf(fatherCpf)) {
    return NextResponse.json({ error: MESSAGES.fatherCpfInvalid }, { status: 400 });
  }

  if (!isValidCpf(motherCpf)) {
    return NextResponse.json({ error: MESSAGES.motherCpfInvalid }, { status: 400 });
  }

  if (!EDUCATION_LEVELS.has(educationLevel)) {
    return NextResponse.json({ error: MESSAGES.educationInvalid }, { status: 400 });
  }

  if (!MARITAL_STATUS.has(maritalStatus)) {
    return NextResponse.json({ error: MESSAGES.maritalInvalid }, { status: 400 });
  }

  const memberTypeValue =
    memberType === "membro" ? "membro" : memberType === "congregado" ? "congregado" : "";
  if (!memberTypeValue) {
    return NextResponse.json({ error: MESSAGES.memberTypeInvalid }, { status: 400 });
  }

  const hasRoleValue =
    memberTypeValue === "membro"
      ? hasRoleRaw === "sim"
        ? 1
        : hasRoleRaw === "nao" || hasRoleRaw === "n\u00e3o"
        ? 0
        : null
      : 0;

  if (memberTypeValue === "membro" && hasRoleValue === null) {
    return NextResponse.json({ error: MESSAGES.hasRoleRequired }, { status: 400 });
  }

  const roleTitleValue = memberTypeValue === "membro" && hasRoleValue === 1 ? roleTitle : "";
  if (memberTypeValue === "membro" && hasRoleValue === 1 && !roleTitleValue) {
    return NextResponse.json({ error: MESSAGES.roleTitleRequired }, { status: 400 });
  }

  const baptizedValue =
    baptizedRaw === "sim" ? 1 : baptizedRaw === "nao" || baptizedRaw === "n\u00e3o" ? 0 : null;

  if (baptizedValue === null) {
    return NextResponse.json({ error: MESSAGES.baptizedRequired }, { status: 400 });
  }

  let baptismDateValue = "";
  if (baptizedValue === 1) {
    const baptismDate = parseIsoDate(baptismDateRaw);
    if (!baptismDate) {
      return NextResponse.json({ error: MESSAGES.baptismDateInvalid }, { status: 400 });
    }
    if (baptismDate > new Date()) {
      return NextResponse.json({ error: MESSAGES.baptismDateFuture }, { status: 400 });
    }
    baptismDateValue = baptismDateRaw;
  }

  const birthDate = parseIsoDate(birthDateRaw);
  if (!birthDate) {
    return NextResponse.json({ error: MESSAGES.birthDateInvalid }, { status: 400 });
  }

  if (birthDate > new Date()) {
    return NextResponse.json({ error: MESSAGES.birthDateFuture }, { status: 400 });
  }

  const age = calcAge(birthDate);
  if (age < 1 || age > 120) {
    return NextResponse.json({ error: MESSAGES.birthDateRange }, { status: 400 });
  }

  if (!isStrongPassword(password)) {
    return NextResponse.json({ error: MESSAGES.weakPassword }, { status: 400 });
  }

  const existing = db
    .prepare("SELECT id, status FROM users WHERE email = ? OR cpf = ? LIMIT 1")
    .get(email, cpf);

  if (existing) {
    const status = String(existing.status ?? "");
    let message = MESSAGES.duplicateBase;
    if (status === "pending") {
      message = MESSAGES.duplicatePending;
    } else if (status === "active") {
      message = MESSAGES.duplicateActive;
    } else if (status === "disabled") {
      message = MESSAGES.duplicateDisabled;
    }
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const now = new Date().toISOString();
  const hash = hashPassword(password);

  db.prepare(
    `
    INSERT INTO users (
      name,
      email,
      cpf,
      father_name,
      father_cpf,
      mother_name,
      mother_cpf,
      birth_date,
      member_type,
      has_role,
      role_title,
      baptized,
      baptism_date,
      profession,
      education_level,
      marital_status,
      age,
      address,
      password_hash,
      role,
      status,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'member', 'pending', ?)
  `
  ).run(
    name,
    email,
    cpf,
    fatherName,
    fatherCpf,
    motherName,
    motherCpf,
    birthDateRaw,
    memberTypeValue,
    hasRoleValue,
    roleTitleValue,
    baptizedValue,
    baptismDateValue,
    profession,
    educationLevel,
    maritalStatus,
    age,
    address,
    hash,
    now
  );

  return NextResponse.json({ ok: true, message: MESSAGES.success }, { status: 201 });
}

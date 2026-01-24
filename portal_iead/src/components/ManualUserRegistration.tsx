
"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import * as XLSX from "xlsx";

type ImportRow = {
  row: number;
  name: string;
  birthDate: string;
  cpf: string;
  email: string;
  memberType: string;
  hasRole: string;
  roleTitle: string;
  baptized: string;
  baptismDate: string;
  profession: string;
  educationLevel: string;
  maritalStatus: string;
  fatherName: string;
  fatherCpf: string;
  motherName: string;
  motherCpf: string;
  address: string;
  password: string;
};

type ImportError = {
  row: number;
  message: string;
};

const TEXT = {
  title: "Cadastro manual de usu\u00e1rios",
  subtitle: "Cadastro completo seguindo o mesmo padr\u00e3o da tela de registro.",
  manual: "Cadastro manual",
  importTitle: "Importar planilha",
  name: "Nome completo",
  email: "E-mail",
  password: "Senha",
  confirm: "Confirmar senha",
  cpf: "CPF",
  birthDate: "Data de nascimento",
  memberType: "Tipo de v\u00ednculo",
  hasRole: "Possui cargo?",
  roleTitle: "Qual cargo?",
  baptized: "\u00c9 batizado?",
  baptismDate: "Data do batismo",
  profession: "Profiss\u00e3o",
  education: "Grau de escolaridade",
  marital: "Estado civil",
  fatherName: "Nome completo do pai",
  fatherCpf: "CPF do pai",
  motherName: "Nome completo da m\u00e3e",
  motherCpf: "CPF da m\u00e3e",
  address: "Endere\u00e7o completo",
  addressHint: "Rua, n\u00famero, bairro, cidade, estado e CEP",
  createUser: "Cadastrar usu\u00e1rio",
  createSuccess: "Cadastro enviado com sucesso.",
  createError: "N\u00e3o foi poss\u00edvel cadastrar o usu\u00e1rio.",
  downloadTemplate: "Baixar modelo XLSX",
  downloadFormPdf: "Baixar formul\u00e1rio individual (PDF)",
  importHint: "Use o modelo XLSX para preencher todos os campos obrigat\u00f3rios.",
  importPreview: "Pr\u00e9via da importa\u00e7\u00e3o",
  importButton: "Importar planilha",
  importSuccess: "Importa\u00e7\u00e3o conclu\u00edda.",
  importError: "N\u00e3o foi poss\u00edvel importar a planilha.",
  rowsReady: "Registros prontos",
  errors: "Erros encontrados",
  selectFile: "Selecione o arquivo XLSX",
  emptyFile: "Nenhum dado encontrado na planilha.",
  passwordMismatch: "As senhas n\u00e3o conferem.",
  passwordWeak:
    "A senha precisa ter no m\u00ednimo 8 caracteres, com letra mai\u00fascula, min\u00fascula, n\u00famero e s\u00edmbolo.",
  invalidCpf: "CPF inv\u00e1lido.",
  invalidFatherCpf: "CPF do pai inv\u00e1lido.",
  invalidMotherCpf: "CPF da m\u00e3e inv\u00e1lido.",
  memberTypeRequired: "Selecione se \u00e9 membro ou congregado.",
  hasRoleRequired: "Informe se possui cargo.",
  roleTitleRequired: "Informe o cargo.",
  baptizedRequired: "Informe se \u00e9 batizado.",
  baptismDateRequired: "Informe a data do batismo.",
  criteria:
    "Crit\u00e9rios de senha: m\u00ednimo 8 caracteres, com letras mai\u00fasculas e min\u00fasculas, n\u00famero e s\u00edmbolo.",
  select: "Selecione",
  yes: "Sim",
  no: "N\u00e3o",
  educationFundamentalIncomplete: "Ensino fundamental incompleto",
  educationFundamentalComplete: "Ensino fundamental completo",
  educationMiddleIncomplete: "Ensino m\u00e9dio incompleto",
  educationMiddleComplete: "Ensino m\u00e9dio completo",
  educationTechnical: "Ensino t\u00e9cnico",
  educationCollegeIncomplete: "Ensino superior incompleto",
  educationCollegeComplete: "Ensino superior completo",
  educationPost: "P\u00f3s-gradua\u00e7\u00e3o",
  educationOther: "Outro",
  maritalSingle: "Solteiro(a)",
  maritalMarried: "Casado(a)",
  maritalDivorced: "Divorciado(a)",
  maritalWidowed: "Vi\u00favo(a)",
  maritalStable: "Uni\u00e3o est\u00e1vel",
  sending: "Enviando...",
  importing: "Importando...",
  missingBasics: "Informe nome, e-mail e senha.",
  birthDateRequired: "Informe data de nascimento.",
  professionRequired: "Informe profiss\u00e3o.",
  educationRequired: "Informe grau de escolaridade.",
  maritalRequired: "Informe estado civil.",
  parentsRequired: "Informe nome do pai e da m\u00e3e.",
  addressRequired: "Informe endere\u00e7o completo.",
};

const TEMPLATE_URL = "/modelos/cadastro-usuarios.xlsx";
const FORM_PDF_URL = "/api/templates/cadastro-individual";

const HEADER_MAP: Record<string, keyof Omit<ImportRow, "row">> = {
  nome: "name",
  nome_completo: "name",
  email: "email",
  cpf: "cpf",
  data_nascimento: "birthDate",
  nascimento: "birthDate",
  tipo_vinculo: "memberType",
  vinculo: "memberType",
  possui_cargo: "hasRole",
  cargo: "roleTitle",
  batizado: "baptized",
  data_batismo: "baptismDate",
  profissao: "profession",
  grau_escolaridade: "educationLevel",
  escolaridade: "educationLevel",
  estado_civil: "maritalStatus",
  nome_pai: "fatherName",
  cpf_pai: "fatherCpf",
  nome_mae: "motherName",
  cpf_mae: "motherCpf",
  endereco: "address",
  senha: "password",
};

const EDUCATION_VALUES: Record<string, string> = {
  fundamental_incompleto: "fundamental_incompleto",
  fundamental_completo: "fundamental_completo",
  medio_incompleto: "medio_incompleto",
  medio_completo: "medio_completo",
  tecnico: "tecnico",
  superior_incompleto: "superior_incompleto",
  superior_completo: "superior_completo",
  pos_graduacao: "pos_graduacao",
  outro: "outro",
  ensino_fundamental_incompleto: "fundamental_incompleto",
  ensino_fundamental_completo: "fundamental_completo",
  ensino_medio_incompleto: "medio_incompleto",
  ensino_medio_completo: "medio_completo",
  ensino_tecnico: "tecnico",
  ensino_superior_incompleto: "superior_incompleto",
  ensino_superior_completo: "superior_completo",
  pos_graduacao_: "pos_graduacao",
  pos_graduacao: "pos_graduacao",
};

const MARITAL_VALUES: Record<string, string> = {
  solteiro: "solteiro",
  casado: "casado",
  divorciado: "divorciado",
  viuvo: "viuvo",
  uniao_estavel: "uniao_estavel",
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeBoolean(value: string) {
  const lower = value.trim().toLowerCase();
  if (lower === "sim" || lower === "s" || lower === "yes" || lower === "1") return "sim";
  if (lower === "nao" || lower === "n\u00e3o" || lower === "n" || lower === "no" || lower === "0")
    return "nao";
  return "";
}

function normalizeMemberType(value: string) {
  const lower = value.trim().toLowerCase();
  if (lower === "membro") return "membro";
  if (lower === "congregado") return "congregado";
  return "";
}

function normalizeEducation(value: string) {
  if (!value) return "";
  const normalized = normalizeHeader(value);
  return EDUCATION_VALUES[normalized] ?? "";
}

function normalizeMarital(value: string) {
  if (!value) return "";
  const normalized = normalizeHeader(value);
  return MARITAL_VALUES[normalized] ?? "";
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function normalizeDate(value: string) {
  const clean = value.trim();
  if (!clean) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const match = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return "";
  return `${match[3]}-${pad2(Number(match[2]))}-${pad2(Number(match[1]))}`;
}

function normalizeDateValue(value: unknown) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      return `${parsed.y}-${pad2(parsed.m)}-${pad2(parsed.d)}`;
    }
  }
  return normalizeDate(String(value));
}

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const digits = normalizeCpf(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
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

function passwordChecks(password: string) {
  return {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^\w\s]/.test(password),
  };
}

function cellToString(value: unknown) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

export default function ManualUserRegistration() {
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    cpf: "",
    email: "",
    memberType: "",
    hasRole: "",
    roleTitle: "",
    baptized: "",
    baptismDate: "",
    profession: "",
    educationLevel: "",
    maritalStatus: "",
    fatherName: "",
    fatherCpf: "",
    motherName: "",
    motherCpf: "",
    address: "",
    password: "",
    confirm: "",
  });
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [fileName, setFileName] = useState("");
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const checks = passwordChecks(form.password);

  function updateMemberType(value: string) {
    setForm((prev) => ({
      ...prev,
      memberType: value,
      hasRole: value === "membro" ? prev.hasRole : "",
      roleTitle: value === "membro" ? prev.roleTitle : "",
    }));
  }

  function updateHasRole(value: string) {
    setForm((prev) => ({
      ...prev,
      hasRole: value,
      roleTitle: value === "sim" ? prev.roleTitle : "",
    }));
  }

  function updateBaptized(value: string) {
    setForm((prev) => ({
      ...prev,
      baptized: value,
      baptismDate: value === "sim" ? prev.baptismDate : "",
    }));
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(null);
    setFormError(null);
    setIsCreating(true);

    if (!isValidCpf(form.cpf)) {
      setFormError(TEXT.invalidCpf);
      setIsCreating(false);
      return;
    }

    if (!isValidCpf(form.fatherCpf)) {
      setFormError(TEXT.invalidFatherCpf);
      setIsCreating(false);
      return;
    }

    if (!isValidCpf(form.motherCpf)) {
      setFormError(TEXT.invalidMotherCpf);
      setIsCreating(false);
      return;
    }

    if (!form.memberType) {
      setFormError(TEXT.memberTypeRequired);
      setIsCreating(false);
      return;
    }

    if (form.memberType === "membro" && !form.hasRole) {
      setFormError(TEXT.hasRoleRequired);
      setIsCreating(false);
      return;
    }

    if (form.memberType === "membro" && form.hasRole === "sim" && !form.roleTitle) {
      setFormError(TEXT.roleTitleRequired);
      setIsCreating(false);
      return;
    }

    if (!form.baptized) {
      setFormError(TEXT.baptizedRequired);
      setIsCreating(false);
      return;
    }

    if (form.baptized === "sim" && !form.baptismDate) {
      setFormError(TEXT.baptismDateRequired);
      setIsCreating(false);
      return;
    }

    if (form.password !== form.confirm) {
      setFormError(TEXT.passwordMismatch);
      setIsCreating(false);
      return;
    }

    if (!Object.values(checks).every(Boolean)) {
      setFormError(TEXT.passwordWeak);
      setIsCreating(false);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        birthDate: form.birthDate,
        cpf: normalizeCpf(form.cpf),
        email: form.email,
        memberType: form.memberType,
        hasRole: form.hasRole,
        roleTitle: form.roleTitle,
        baptized: form.baptized,
        baptismDate: form.baptismDate,
        profession: form.profession,
        educationLevel: form.educationLevel,
        maritalStatus: form.maritalStatus,
        fatherName: form.fatherName,
        fatherCpf: normalizeCpf(form.fatherCpf),
        motherName: form.motherName,
        motherCpf: normalizeCpf(form.motherCpf),
        address: form.address,
        password: form.password,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setFormError(payload.error ?? TEXT.createError);
      setIsCreating(false);
      return;
    }

    setFormMessage(TEXT.createSuccess);
    setForm({
      name: "",
      birthDate: "",
      cpf: "",
      email: "",
      memberType: "",
      hasRole: "",
      roleTitle: "",
      baptized: "",
      baptismDate: "",
      profession: "",
      educationLevel: "",
      maritalStatus: "",
      fatherName: "",
      fatherCpf: "",
      motherName: "",
      motherCpf: "",
      address: "",
      password: "",
      confirm: "",
    });
    setIsCreating(false);
  }

  function buildImportRows(rows: unknown[][]) {
    const sanitized = rows.filter((row) =>
      row.some((cell) => {
        if (cell === null || cell === undefined) return false;
        if (typeof cell === "string") return cell.trim() !== "";
        return true;
      })
    );

    if (sanitized.length < 2) {
      setImportRows([]);
      setImportErrors([{ row: 0, message: TEXT.emptyFile }]);
      return;
    }

    const headerRow = sanitized[0].map((cell) => cellToString(cell));
    const mappedKeys = headerRow.map((value) => HEADER_MAP[normalizeHeader(value)]);

    const rowsParsed: ImportRow[] = [];
    const errors: ImportError[] = [];

    for (let i = 1; i < sanitized.length; i += 1) {
      const values = sanitized[i];
      const record: Partial<Omit<ImportRow, "row">> = {};

      mappedKeys.forEach((mapped, idx) => {
        if (!mapped) return;
        const raw = values[idx];
        if (mapped === "birthDate" || mapped === "baptismDate") {
          record[mapped] = normalizeDateValue(raw);
        } else {
          record[mapped] = cellToString(raw);
        }
      });

      const rowData: ImportRow = {
        row: i + 1,
        name: String(record.name ?? "").trim(),
        email: String(record.email ?? "").trim().toLowerCase(),
        cpf: normalizeCpf(String(record.cpf ?? "")),
        birthDate: normalizeDate(String(record.birthDate ?? "")),
        memberType: normalizeMemberType(String(record.memberType ?? "")),
        hasRole: normalizeBoolean(String(record.hasRole ?? "")),
        roleTitle: String(record.roleTitle ?? "").trim(),
        baptized: normalizeBoolean(String(record.baptized ?? "")),
        baptismDate: normalizeDate(String(record.baptismDate ?? "")),
        profession: String(record.profession ?? "").trim(),
        educationLevel: normalizeEducation(String(record.educationLevel ?? "")),
        maritalStatus: normalizeMarital(String(record.maritalStatus ?? "")),
        fatherName: String(record.fatherName ?? "").trim(),
        fatherCpf: normalizeCpf(String(record.fatherCpf ?? "")),
        motherName: String(record.motherName ?? "").trim(),
        motherCpf: normalizeCpf(String(record.motherCpf ?? "")),
        address: String(record.address ?? "").trim(),
        password: String(record.password ?? "").trim(),
      };

      const rowErrors: string[] = [];
      if (!rowData.name || !rowData.email || !rowData.password) {
        rowErrors.push(TEXT.missingBasics);
      }
      if (!rowData.cpf || !isValidCpf(rowData.cpf)) {
        rowErrors.push(TEXT.invalidCpf);
      }
      if (!rowData.fatherCpf || !isValidCpf(rowData.fatherCpf)) {
        rowErrors.push(TEXT.invalidFatherCpf);
      }
      if (!rowData.motherCpf || !isValidCpf(rowData.motherCpf)) {
        rowErrors.push(TEXT.invalidMotherCpf);
      }
      if (!rowData.memberType) {
        rowErrors.push(TEXT.memberTypeRequired);
      }
      if (rowData.memberType === "membro" && !rowData.hasRole) {
        rowErrors.push(TEXT.hasRoleRequired);
      }
      if (rowData.memberType === "membro" && rowData.hasRole === "sim" && !rowData.roleTitle) {
        rowErrors.push(TEXT.roleTitleRequired);
      }
      if (!rowData.baptized) {
        rowErrors.push(TEXT.baptizedRequired);
      }
      if (rowData.baptized === "sim" && !rowData.baptismDate) {
        rowErrors.push(TEXT.baptismDateRequired);
      }
      if (!rowData.birthDate) {
        rowErrors.push(TEXT.birthDateRequired);
      }
      if (!rowData.profession) {
        rowErrors.push(TEXT.professionRequired);
      }
      if (!rowData.educationLevel) {
        rowErrors.push(TEXT.educationRequired);
      }
      if (!rowData.maritalStatus) {
        rowErrors.push(TEXT.maritalRequired);
      }
      if (!rowData.fatherName || !rowData.motherName) {
        rowErrors.push(TEXT.parentsRequired);
      }
      if (!rowData.address) {
        rowErrors.push(TEXT.addressRequired);
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowData.row, message: rowErrors.join(" ") });
        continue;
      }

      rowsParsed.push(rowData);
    }

    if (rowsParsed.length === 0 && errors.length === 0) {
      errors.push({ row: 0, message: TEXT.emptyFile });
    }

    setImportRows(rowsParsed);
    setImportErrors(errors);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setImportMessage(null);
    setImportError(null);

    const file = event.target.files?.[0];
    if (!file) {
      setFileName("");
      setImportRows([]);
      setImportErrors([]);
      return;
    }

    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        setImportRows([]);
        setImportErrors([{ row: 0, message: TEXT.emptyFile }]);
        return;
      }
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as unknown[][];
      buildImportRows(rows);
    } catch (error) {
      setImportRows([]);
      setImportErrors([{ row: 0, message: TEXT.importError }]);
      setImportError(String(error));
    }
  }

  async function handleImport() {
    if (importRows.length === 0) return;
    setImportMessage(null);
    setImportError(null);
    setIsImporting(true);

    const errors: ImportError[] = [];
    let created = 0;

    for (const row of importRows) {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: row.name,
          birthDate: row.birthDate,
          cpf: row.cpf,
          email: row.email,
          memberType: row.memberType,
          hasRole: row.hasRole,
          roleTitle: row.roleTitle,
          baptized: row.baptized,
          baptismDate: row.baptismDate,
          profession: row.profession,
          educationLevel: row.educationLevel,
          maritalStatus: row.maritalStatus,
          fatherName: row.fatherName,
          fatherCpf: row.fatherCpf,
          motherName: row.motherName,
          motherCpf: row.motherCpf,
          address: row.address,
          password: row.password,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        errors.push({ row: row.row, message: payload.error ?? TEXT.importError });
        continue;
      }

      created += 1;
    }

    setImportErrors(errors);
    setImportMessage(`${TEXT.importSuccess} Criados: ${created}. Erros: ${errors.length}.`);
    setIsImporting(false);
  }

  const previewRows = useMemo(() => importRows.slice(0, 5), [importRows]);

  return (
    <section className="manual-users">
      <div className="manual-card">
        <div className="board-header">
          <div>
            <p className="kicker">{TEXT.manual}</p>
            <h2>{TEXT.title}</h2>
            <p className="section-text">{TEXT.subtitle}</p>
          </div>
        </div>
        <form className="auth-form" onSubmit={handleCreateUser}>
          <div className="register-grid">
            <label>
              {TEXT.name}
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </label>
            <label>
              {TEXT.birthDate}
              <input
                type="date"
                value={form.birthDate}
                onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
                required
              />
            </label>
            <label>
              {TEXT.cpf}
              <input
                type="text"
                inputMode="numeric"
                value={form.cpf}
                onChange={(event) => setForm({ ...form, cpf: formatCpf(event.target.value) })}
                placeholder="000.000.000-00"
                required
              />
            </label>
            <label>
              {TEXT.email}
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>
            <label>
              {TEXT.memberType}
              <select
                value={form.memberType}
                onChange={(event) => updateMemberType(event.target.value)}
                required
              >
                <option value="">{TEXT.select}</option>
                <option value="membro">Membro</option>
                <option value="congregado">Congregado</option>
              </select>
            </label>
            {form.memberType === "membro" ? (
              <label>
                {TEXT.hasRole}
                <select
                  value={form.hasRole}
                  onChange={(event) => updateHasRole(event.target.value)}
                  required
                >
                  <option value="">{TEXT.select}</option>
                  <option value="sim">{TEXT.yes}</option>
                  <option value="nao">{TEXT.no}</option>
                </select>
              </label>
            ) : null}
            {form.memberType === "membro" && form.hasRole === "sim" ? (
              <label>
                {TEXT.roleTitle}
                <input
                  type="text"
                  value={form.roleTitle}
                  onChange={(event) => setForm({ ...form, roleTitle: event.target.value })}
                  required
                />
              </label>
            ) : null}
            <label>
              {TEXT.baptized}
              <select
                value={form.baptized}
                onChange={(event) => updateBaptized(event.target.value)}
                required
              >
                <option value="">{TEXT.select}</option>
                <option value="sim">{TEXT.yes}</option>
                <option value="nao">{TEXT.no}</option>
              </select>
            </label>
            {form.baptized === "sim" ? (
              <label>
                {TEXT.baptismDate}
                <input
                  type="date"
                  value={form.baptismDate}
                  onChange={(event) => setForm({ ...form, baptismDate: event.target.value })}
                  required
                />
              </label>
            ) : null}
            <label>
              {TEXT.profession}
              <input
                type="text"
                value={form.profession}
                onChange={(event) => setForm({ ...form, profession: event.target.value })}
                required
              />
            </label>
            <label>
              {TEXT.education}
              <select
                value={form.educationLevel}
                onChange={(event) => setForm({ ...form, educationLevel: event.target.value })}
                required
              >
                <option value="">{TEXT.select}</option>
                <option value="fundamental_incompleto">
                  {TEXT.educationFundamentalIncomplete}
                </option>
                <option value="fundamental_completo">
                  {TEXT.educationFundamentalComplete}
                </option>
                <option value="medio_incompleto">{TEXT.educationMiddleIncomplete}</option>
                <option value="medio_completo">{TEXT.educationMiddleComplete}</option>
                <option value="tecnico">{TEXT.educationTechnical}</option>
                <option value="superior_incompleto">{TEXT.educationCollegeIncomplete}</option>
                <option value="superior_completo">{TEXT.educationCollegeComplete}</option>
                <option value="pos_graduacao">{TEXT.educationPost}</option>
                <option value="outro">{TEXT.educationOther}</option>
              </select>
            </label>
            <label>
              {TEXT.marital}
              <select
                value={form.maritalStatus}
                onChange={(event) => setForm({ ...form, maritalStatus: event.target.value })}
                required
              >
                <option value="">{TEXT.select}</option>
                <option value="solteiro">{TEXT.maritalSingle}</option>
                <option value="casado">{TEXT.maritalMarried}</option>
                <option value="divorciado">{TEXT.maritalDivorced}</option>
                <option value="viuvo">{TEXT.maritalWidowed}</option>
                <option value="uniao_estavel">{TEXT.maritalStable}</option>
              </select>
            </label>
            <label>
              {TEXT.fatherName}
              <input
                type="text"
                value={form.fatherName}
                onChange={(event) => setForm({ ...form, fatherName: event.target.value })}
                required
              />
            </label>
            <label>
              {TEXT.fatherCpf}
              <input
                type="text"
                inputMode="numeric"
                value={form.fatherCpf}
                onChange={(event) => setForm({ ...form, fatherCpf: formatCpf(event.target.value) })}
                placeholder="000.000.000-00"
                required
              />
            </label>
            <label>
              {TEXT.motherName}
              <input
                type="text"
                value={form.motherName}
                onChange={(event) => setForm({ ...form, motherName: event.target.value })}
                required
              />
            </label>
            <label>
              {TEXT.motherCpf}
              <input
                type="text"
                inputMode="numeric"
                value={form.motherCpf}
                onChange={(event) => setForm({ ...form, motherCpf: formatCpf(event.target.value) })}
                placeholder="000.000.000-00"
                required
              />
            </label>
            <label className="full">
              {TEXT.address}
              <textarea
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                placeholder={TEXT.addressHint}
                required
              />
            </label>
            <label>
              {TEXT.password}
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </label>
            <label>
              {TEXT.confirm}
              <input
                type="password"
                value={form.confirm}
                onChange={(event) => setForm({ ...form, confirm: event.target.value })}
                required
              />
            </label>
            <p className="form-hint full">{TEXT.criteria}</p>
          </div>
          {formError ? <span className="auth-error">{formError}</span> : null}
          {formMessage ? <span className="auth-success">{formMessage}</span> : null}
          <button className="cta primary" type="submit" disabled={isCreating}>
            {isCreating ? TEXT.sending : TEXT.createUser}
          </button>
        </form>
      </div>

      <div className="manual-card">
        <div className="board-header">
          <div>
            <p className="kicker">{TEXT.importTitle}</p>
            <h2>{TEXT.importTitle}</h2>
            <p className="section-text">{TEXT.importHint}</p>
          </div>
          <div className="board-actions">
            <a className="cta ghost" href={TEMPLATE_URL} download>
              {TEXT.downloadTemplate}
            </a>
            <a className="cta ghost" href={FORM_PDF_URL}>
              {TEXT.downloadFormPdf}
            </a>
          </div>
        </div>

        <div className="import-area">
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
          />
          <span className="import-file">{fileName || TEXT.selectFile}</span>
        </div>

        {importErrors.length > 0 ? (
          <div className="import-errors">
            <strong>{TEXT.errors}</strong>
            <ul>
              {importErrors.slice(0, 6).map((errorItem) => (
                <li key={`${errorItem.row}-${errorItem.message}`}>
                  Linha {errorItem.row}: {errorItem.message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="import-summary">
          <span>{TEXT.rowsReady}:</span>
          <strong>{importRows.length}</strong>
          <button
            className="cta primary"
            type="button"
            onClick={handleImport}
            disabled={importRows.length === 0 || isImporting}
          >
            {isImporting ? TEXT.importing : TEXT.importButton}
          </button>
        </div>

        {importMessage ? <span className="auth-success">{importMessage}</span> : null}
        {importError ? <span className="auth-error">{importError}</span> : null}

        {previewRows.length > 0 ? (
          <div className="import-preview">
            <h3>{TEXT.importPreview}</h3>
            <table>
              <thead>
                <tr>
                  <th>{TEXT.name}</th>
                  <th>{TEXT.email}</th>
                  <th>{TEXT.cpf}</th>
                  <th>{TEXT.memberType}</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={`${row.email}-${row.row}`}>
                    <td>{row.name}</td>
                    <td>{row.email}</td>
                    <td>{row.cpf || "-"}</td>
                    <td>{row.memberType || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}

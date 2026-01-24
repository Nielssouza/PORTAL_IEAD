"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Member = {
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

type Filters = {
  search: string;
  status: string;
  role: string;
  memberType: string;
  baptized: string;
  education: string;
  marital: string;
  createdFrom: string;
  createdTo: string;
};

type EditForm = {
  name: string;
  role: "admin" | "member";
  status: "active" | "pending" | "disabled";
  password: string;
};

const TEXT = {
  filters: "Filtros",
  searchPlaceholder: "Buscar por nome, e-mail ou CPF",
  status: "Status",
  role: "Perfil",
  memberType: "V\u00ednculo",
  baptized: "Batizado",
  education: "Escolaridade",
  marital: "Estado civil",
  createdFrom: "Cadastro a partir de",
  createdTo: "Cadastro at\u00e9",
  clear: "Limpar filtros",
  results: "Resultados",
  name: "Nome",
  email: "E-mail",
  cpf: "CPF",
  statusLabel: "Status",
  roleLabel: "Perfil",
  memberTypeLabel: "V\u00ednculo",
  baptizedLabel: "Batizado",
  roleTitle: "Cargo",
  profession: "Profiss\u00e3o",
  educationLabel: "Escolaridade",
  maritalLabel: "Estado civil",
  createdAt: "Cadastro",
  birthDate: "Nascimento",
  empty: "Nenhum cadastro encontrado com os filtros selecionados.",
  actions: "A\u00e7\u00f5es",
  edit: "Editar",
  cancel: "Cancelar",
  save: "Salvar",
  updateError: "N\u00e3o foi poss\u00edvel atualizar o usu\u00e1rio.",
  editName: "Nome",
  editRole: "Perfil",
  editStatus: "Status",
  editPassword: "Nova senha (opcional)",
  admin: "Admin",
  member: "Membro",
  active: "Ativo",
  pending: "Pendente",
  disabled: "Bloqueado",
};

const STATUS_LABELS: Record<Member["status"], string> = {
  active: TEXT.active,
  pending: TEXT.pending,
  disabled: TEXT.disabled,
};

const ROLE_LABELS: Record<Member["role"], string> = {
  admin: TEXT.admin,
  member: TEXT.member,
};

const MEMBER_TYPE_LABELS: Record<string, string> = {
  membro: "Membro",
  congregado: "Congregado",
};

const EDUCATION_LABELS: Record<string, string> = {
  fundamental_incompleto: "Ensino fundamental incompleto",
  fundamental_completo: "Ensino fundamental completo",
  medio_incompleto: "Ensino m\u00e9dio incompleto",
  medio_completo: "Ensino m\u00e9dio completo",
  tecnico: "Ensino t\u00e9cnico",
  superior_incompleto: "Ensino superior incompleto",
  superior_completo: "Ensino superior completo",
  pos_graduacao: "P\u00f3s-gradua\u00e7\u00e3o",
  outro: "Outro",
};

const MARITAL_LABELS: Record<string, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  divorciado: "Divorciado(a)",
  viuvo: "Vi\u00favo(a)",
  uniao_estavel: "Uni\u00e3o est\u00e1vel",
};

const COLUMN_COUNT = 14;

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function parseDateFilter(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export default function MembersList({ users }: { users: Member[] }) {
  const [items, setItems] = useState<Member[]>(users);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    role: "",
    memberType: "",
    baptized: "",
    education: "",
    marital: "",
    createdFrom: "",
    createdTo: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    role: "member",
    status: "active",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    setItems(users);
  }, [users]);

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const from = parseDateFilter(filters.createdFrom);
    const to = parseDateFilter(filters.createdTo);

    return items.filter((user) => {
      if (filters.status && user.status !== filters.status) return false;
      if (filters.role && user.role !== filters.role) return false;
      if (filters.memberType && user.memberType !== filters.memberType) return false;
      if (filters.baptized) {
        const baptizedValue = user.baptized === 1 ? "sim" : user.baptized === 0 ? "nao" : "";
        if (baptizedValue !== filters.baptized) return false;
      }
      if (filters.education && user.educationLevel !== filters.education) return false;
      if (filters.marital && user.maritalStatus !== filters.marital) return false;

      if (from || to) {
        const createdAt = user.createdAt ? new Date(user.createdAt) : null;
        if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
        if (from && createdAt < from) return false;
        if (to) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          if (createdAt > end) return false;
        }
      }

      if (!query) return true;
      const haystack = [
        user.name,
        user.email,
        user.cpf ?? "",
        user.roleTitle ?? "",
        user.profession ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filters, items]);

  function updateField<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters({
      search: "",
      status: "",
      role: "",
      memberType: "",
      baptized: "",
      education: "",
      marital: "",
      createdFrom: "",
      createdTo: "",
    });
  }

  function startEdit(user: Member) {
    setError(null);
    setEditingId(user.id);
    setEditForm({ name: user.name, role: user.role, status: user.status, password: "" });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ name: "", role: "member", status: "active", password: "" });
    setError(null);
  }

  async function handleUpdate(userId: number) {
    setSavingId(userId);
    setError(null);

    const response = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? TEXT.updateError);
      setSavingId(null);
      return;
    }

    setItems((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, name: editForm.name, role: editForm.role, status: editForm.status }
          : user
      )
    );
    setSavingId(null);
    cancelEdit();
  }

  function renderEditRow(user: Member): ReactNode {
    if (editingId !== user.id) return null;
    return (
      <tr className="members-edit-row">
        <td colSpan={COLUMN_COUNT}>
          <div className="members-edit">
            <div className="members-edit-field">
              <label>{TEXT.editName}</label>
              <input
                value={editForm.name}
                onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
              />
            </div>
            <div className="members-edit-field">
              <label>{TEXT.editRole}</label>
              <select
                value={editForm.role}
                onChange={(event) =>
                  setEditForm({ ...editForm, role: event.target.value as "admin" | "member" })
                }
              >
                <option value="member">{TEXT.member}</option>
                <option value="admin">{TEXT.admin}</option>
              </select>
            </div>
            <div className="members-edit-field">
              <label>{TEXT.editStatus}</label>
              <select
                value={editForm.status}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    status: event.target.value as "active" | "pending" | "disabled",
                  })
                }
              >
                <option value="active">{TEXT.active}</option>
                <option value="pending">{TEXT.pending}</option>
                <option value="disabled">{TEXT.disabled}</option>
              </select>
            </div>
            <div className="members-edit-field">
              <label>{TEXT.editPassword}</label>
              <input
                type="password"
                value={editForm.password}
                onChange={(event) => setEditForm({ ...editForm, password: event.target.value })}
              />
            </div>
            {error ? <span className="auth-error">{error}</span> : null}
            <div className="members-edit-actions">
              <button className="cta ghost" type="button" onClick={cancelEdit}>
                {TEXT.cancel}
              </button>
              <button
                className="cta primary"
                type="button"
                onClick={() => handleUpdate(user.id)}
                disabled={savingId === user.id}
              >
                {savingId === user.id ? "Salvando..." : TEXT.save}
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <section className="members-section">
      <div className="members-filters">
        <div className="filter-row">
          <div className="filter-field filter-search">
            <label>{TEXT.filters}</label>
            <input
              type="text"
              placeholder={TEXT.searchPlaceholder}
              value={filters.search}
              onChange={(event) => updateField("search", event.target.value)}
            />
          </div>
          <div className="filter-field">
            <label>{TEXT.status}</label>
            <select
              value={filters.status}
              onChange={(event) => updateField("status", event.target.value)}
            >
              <option value="">Todos</option>
              <option value="active">{TEXT.active}</option>
              <option value="pending">{TEXT.pending}</option>
              <option value="disabled">{TEXT.disabled}</option>
            </select>
          </div>
          <div className="filter-field">
            <label>{TEXT.role}</label>
            <select value={filters.role} onChange={(event) => updateField("role", event.target.value)}>
              <option value="">Todos</option>
              <option value="admin">{TEXT.admin}</option>
              <option value="member">{TEXT.member}</option>
            </select>
          </div>
          <div className="filter-field">
            <label>{TEXT.memberType}</label>
            <select
              value={filters.memberType}
              onChange={(event) => updateField("memberType", event.target.value)}
            >
              <option value="">Todos</option>
              <option value="membro">Membro</option>
              <option value="congregado">Congregado</option>
            </select>
          </div>
        </div>
        <div className="filter-row">
          <div className="filter-field">
            <label>{TEXT.baptized}</label>
            <select
              value={filters.baptized}
              onChange={(event) => updateField("baptized", event.target.value)}
            >
              <option value="">Todos</option>
              <option value="sim">Sim</option>
              <option value="nao">N\u00e3o</option>
            </select>
          </div>
          <div className="filter-field">
            <label>{TEXT.education}</label>
            <select
              value={filters.education}
              onChange={(event) => updateField("education", event.target.value)}
            >
              <option value="">Todos</option>
              {Object.entries(EDUCATION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label>{TEXT.marital}</label>
            <select
              value={filters.marital}
              onChange={(event) => updateField("marital", event.target.value)}
            >
              <option value="">Todos</option>
              {Object.entries(MARITAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label>{TEXT.createdFrom}</label>
            <input
              type="date"
              value={filters.createdFrom}
              onChange={(event) => updateField("createdFrom", event.target.value)}
            />
          </div>
          <div className="filter-field">
            <label>{TEXT.createdTo}</label>
            <input
              type="date"
              value={filters.createdTo}
              onChange={(event) => updateField("createdTo", event.target.value)}
            />
          </div>
          <div className="filter-actions">
            <button className="cta ghost" type="button" onClick={clearFilters}>
              {TEXT.clear}
            </button>
          </div>
        </div>
      </div>

      <div className="members-summary">
        <span>{TEXT.results}:</span>
        <strong>{filtered.length}</strong>
      </div>

      <div className="members-table">
        {filtered.length === 0 ? (
          <p className="section-text members-empty">{TEXT.empty}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{TEXT.name}</th>
                <th>{TEXT.email}</th>
                <th>{TEXT.cpf}</th>
                <th>{TEXT.statusLabel}</th>
                <th>{TEXT.roleLabel}</th>
                <th>{TEXT.memberTypeLabel}</th>
                <th>{TEXT.baptizedLabel}</th>
                <th>{TEXT.roleTitle}</th>
                <th>{TEXT.profession}</th>
                <th>{TEXT.educationLabel}</th>
                <th>{TEXT.maritalLabel}</th>
                <th>{TEXT.birthDate}</th>
                <th>{TEXT.createdAt}</th>
                <th>{TEXT.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <Fragment key={user.id}>
                  <tr>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.cpf ?? "-"}</td>
                    <td>
                      <span className={`members-chip status-${user.status}`}>
                        {STATUS_LABELS[user.status]}
                      </span>
                    </td>
                    <td>{ROLE_LABELS[user.role]}</td>
                    <td>
                      {user.memberType ? MEMBER_TYPE_LABELS[user.memberType] ?? user.memberType : "-"}
                    </td>
                    <td>{user.baptized === 1 ? "Sim" : user.baptized === 0 ? "N\u00e3o" : "-"}</td>
                    <td>
                      {user.hasRole === 1 ? user.roleTitle ?? "-" : user.hasRole === 0 ? "N\u00e3o" : "-"}
                    </td>
                    <td>{user.profession ?? "-"}</td>
                    <td>
                      {user.educationLevel
                        ? EDUCATION_LABELS[user.educationLevel] ?? user.educationLevel
                        : "-"}
                    </td>
                    <td>
                      {user.maritalStatus ? MARITAL_LABELS[user.maritalStatus] ?? user.maritalStatus : "-"}
                    </td>
                    <td>{formatDate(user.birthDate)}</td>
                    <td>{formatDateTime(user.createdAt)}</td>
                    <td>
                      <button className="cta small" type="button" onClick={() => startEdit(user)}>
                        {TEXT.edit}
                      </button>
                    </td>
                  </tr>
                  {renderEditRow(user)}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import PageViewTracker from "@/components/PageViewTracker";

const TEXT = {
  invalidCpf: "CPF inv\u00e1lido. Verifique e tente novamente.",
  invalidFatherCpf: "CPF do pai inv\u00e1lido.",
  invalidMotherCpf: "CPF da m\u00e3e inv\u00e1lido.",
  memberTypeRequired: "Selecione se \u00e9 membro ou congregado.",
  hasRoleRequired: "Informe se possui cargo.",
  roleTitleRequired: "Informe o cargo.",
  baptizedRequired: "Informe se \u00e9 batizado.",
  baptismDateRequired: "Informe a data do batismo.",
  passwordMismatch: "As senhas n\u00e3o conferem.",
  passwordWeak:
    "A senha precisa ter no m\u00ednimo 8 caracteres, com letra mai\u00fascula, min\u00fascula, n\u00famero e s\u00edmbolo.",
  submitError: "N\u00e3o foi poss\u00edvel enviar o cadastro.",
  success:
    "Cadastro enviado com sucesso. Aguarde a efetiva\u00e7\u00e3o do cadastro para acessar o portal.",
  brandSubtitle: "Minist\u00e9rio Miss\u00e3o Jardim das Oliveiras",
  heading: "Fa\u00e7a seu cadastro",
  intro:
    "Complete os dados abaixo para solicitar o acesso. Ap\u00f3s o envio, nossa equipe ir\u00e1 validar seu cadastro.",
  tipoVinculo: "Tipo de v\u00ednculo",
  possuiCargo: "Possui cargo?",
  qualCargo: "Qual cargo?",
  batizado: "\u00c9 batizado?",
  dataBatismo: "Data do batismo",
  profissao: "Profiss\u00e3o",
  suaProfissao: "Sua profiss\u00e3o",
  grauEscolaridade: "Grau de escolaridade",
  estadoCivil: "Estado civil",
  nao: "N\u00e3o",
  ensinoMedioIncompleto: "Ensino m\u00e9dio incompleto",
  ensinoMedioCompleto: "Ensino m\u00e9dio completo",
  ensinoTecnico: "Ensino t\u00e9cnico",
  posGraduacao: "P\u00f3s-gradua\u00e7\u00e3o",
  viuvo: "Vi\u00favo(a)",
  uniaoEstavel: "Uni\u00e3o est\u00e1vel",
  nomeMae: "Nome completo da m\u00e3e",
  cpfMae: "CPF da m\u00e3e",
  enderecoCompleto: "Endere\u00e7o completo",
  enderecoPlaceholder: "Rua, n\u00famero, bairro, cidade, estado e CEP",
  criteriosSenha:
    "Crit\u00e9rios de senha: m\u00ednimo 8 caracteres, com letras mai\u00fasculas e min\u00fasculas, n\u00famero e s\u00edmbolo.",
  jaTenhoAcesso: "J\u00e1 tenho acesso",
  cadastro: "Cadastro",
};

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

export default function RegistroPage() {
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
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBanner(null);

    if (!isValidCpf(form.cpf)) {
      setBanner({ type: "error", text: TEXT.invalidCpf });
      return;
    }

    if (!isValidCpf(form.fatherCpf)) {
      setBanner({ type: "error", text: TEXT.invalidFatherCpf });
      return;
    }

    if (!isValidCpf(form.motherCpf)) {
      setBanner({ type: "error", text: TEXT.invalidMotherCpf });
      return;
    }

    if (!form.memberType) {
      setBanner({ type: "error", text: TEXT.memberTypeRequired });
      return;
    }

    if (form.memberType === "membro" && !form.hasRole) {
      setBanner({ type: "error", text: TEXT.hasRoleRequired });
      return;
    }

    if (form.memberType === "membro" && form.hasRole === "sim" && !form.roleTitle) {
      setBanner({ type: "error", text: TEXT.roleTitleRequired });
      return;
    }

    if (!form.baptized) {
      setBanner({ type: "error", text: TEXT.baptizedRequired });
      return;
    }

    if (form.baptized === "sim" && !form.baptismDate) {
      setBanner({ type: "error", text: TEXT.baptismDateRequired });
      return;
    }

    if (form.password !== form.confirm) {
      setBanner({ type: "error", text: TEXT.passwordMismatch });
      return;
    }

    if (!Object.values(checks).every(Boolean)) {
      setBanner({
        type: "error",
        text: TEXT.passwordWeak,
      });
      return;
    }

    setLoading(true);
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

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setBanner({
        type: "error",
        text: payload.error ?? TEXT.submitError,
      });
      setLoading(false);
      return;
    }

    setBanner({
      type: "success",
      text: payload.message ?? TEXT.success,
    });
    setLoading(false);
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
  }

  return (
    <main className="auth-page">
      <PageViewTracker path="/register" />
      <section className="auth-card register-card">
        <div className="auth-brand">
          <Link className="auth-logo" href="/">
            <div className="logo-shell">
              <Image
                src="https://ljillcmdebyomomjvwxh.supabase.co/storage/v1/object/public/midias-portal-iead/logo.jfif"
                alt="Logo Assembleia de Deus"
                width={72}
                height={72}
                className="logo"
              />
            </div>
            <div>
              <p className="brand-title">Assembleia de Deus</p>
              <span className="brand-sub">{TEXT.brandSubtitle}</span>
            </div>
          </Link>
        </div>
        <div>
          <p className="kicker">{TEXT.cadastro}</p>
          <h1>{TEXT.heading}</h1>
          <p className="section-text">{TEXT.intro}</p>
        </div>
        {banner ? <div className={`form-banner ${banner.type}`}>{banner.text}</div> : null}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="register-grid">
            <label>
              Nome completo
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Seu nome e sobrenome"
                required
              />
            </label>
            <label>
              Data de nascimento
              <input
                type="date"
                value={form.birthDate}
                onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
                required
              />
            </label>
            <label>
              CPF
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
              E-mail
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="seu@email.com"
                required
              />
            </label>
            <label>
              {TEXT.tipoVinculo}
              <select
                value={form.memberType}
                onChange={(event) => updateMemberType(event.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="membro">Membro</option>
                <option value="congregado">Congregado</option>
              </select>
            </label>
            {form.memberType === "membro" ? (
              <label>
                {TEXT.possuiCargo}
                <select
                  value={form.hasRole}
                  onChange={(event) => updateHasRole(event.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">{TEXT.nao}</option>
                </select>
              </label>
            ) : null}
            {form.memberType === "membro" && form.hasRole === "sim" ? (
              <label>
                {TEXT.qualCargo}
                <input
                  type="text"
                  value={form.roleTitle}
                  onChange={(event) => setForm({ ...form, roleTitle: event.target.value })}
                  placeholder="Digite o cargo"
                  required
                />
              </label>
            ) : null}
            <label>
              {TEXT.batizado}
              <select
                value={form.baptized}
                onChange={(event) => updateBaptized(event.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">{TEXT.nao}</option>
              </select>
            </label>
            {form.baptized === "sim" ? (
              <label>
                {TEXT.dataBatismo}
                <input
                  type="date"
                  value={form.baptismDate}
                  onChange={(event) => setForm({ ...form, baptismDate: event.target.value })}
                  required
                />
              </label>
            ) : null}
            <label>
              {TEXT.profissao}
              <input
                type="text"
                value={form.profession}
                onChange={(event) => setForm({ ...form, profession: event.target.value })}
                placeholder={TEXT.suaProfissao}
                required
              />
            </label>
            <label>
              {TEXT.grauEscolaridade}
              <select
                value={form.educationLevel}
                onChange={(event) => setForm({ ...form, educationLevel: event.target.value })}
                required
              >
                <option value="">Selecione</option>
                <option value="fundamental_incompleto">Ensino fundamental incompleto</option>
                <option value="fundamental_completo">Ensino fundamental completo</option>
                <option value="medio_incompleto">{TEXT.ensinoMedioIncompleto}</option>
                <option value="medio_completo">{TEXT.ensinoMedioCompleto}</option>
                <option value="tecnico">{TEXT.ensinoTecnico}</option>
                <option value="superior_incompleto">Ensino superior incompleto</option>
                <option value="superior_completo">Ensino superior completo</option>
                <option value="pos_graduacao">{TEXT.posGraduacao}</option>
                <option value="outro">Outro</option>
              </select>
            </label>
            <label>
              {TEXT.estadoCivil}
              <select
                value={form.maritalStatus}
                onChange={(event) => setForm({ ...form, maritalStatus: event.target.value })}
                required
              >
                <option value="">Selecione</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">{TEXT.viuvo}</option>
                <option value="uniao_estavel">{TEXT.uniaoEstavel}</option>
              </select>
            </label>
            <label>
              Nome completo do pai
              <input
                type="text"
                value={form.fatherName}
                onChange={(event) => setForm({ ...form, fatherName: event.target.value })}
                placeholder="Nome completo do pai"
                required
              />
            </label>
            <label>
              CPF do pai
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
              {TEXT.nomeMae}
              <input
                type="text"
                value={form.motherName}
                onChange={(event) => setForm({ ...form, motherName: event.target.value })}
                placeholder={TEXT.nomeMae}
                required
              />
            </label>
            <label>
              {TEXT.cpfMae}
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
              {TEXT.enderecoCompleto}
              <textarea
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                placeholder={TEXT.enderecoPlaceholder}
                required
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="Crie uma senha segura"
                required
              />
            </label>
            <label>
              Confirmar senha
              <input
                type="password"
                value={form.confirm}
                onChange={(event) => setForm({ ...form, confirm: event.target.value })}
                placeholder="Repita a senha"
                required
              />
            </label>
            <p className="form-hint full">{TEXT.criteriosSenha}</p>
          </div>
          <div className="form-actions">
            <button className="cta primary" type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar cadastro"}
            </button>
            <Link className="cta ghost" href="/login">
              {TEXT.jaTenhoAcesso}
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

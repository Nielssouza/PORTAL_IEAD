# Portal IEAD - Next.js (Frontend + API no mesmo servidor)

Este reposit?rio contem um unico app Next.js em `portal_iead/`, com interface e API rodando no mesmo servidor.

## Requisitos
- Node.js LTS
- npm

## Primeiro uso
1) Instale as dependencias:

```bash
cd portal_iead
npm install
```

2) (Opcional) Copie o arquivo de ambiente:

```bash
copy portal_iead\.env.example portal_iead\.env.local
```

3) Suba o servidor:

```bash
cd portal_iead
npm run dev
```

## Conexão com o banco (DBeaver - Supabase)
Use os dados abaixo (sem senha):

- Host: aws-1-sa-east-1.pooler.supabase.com
- Porta: 6543
- Database: postgres
- Usuário: postgres.ljillcmdebyomomjvwxh

## Endpoints de exemplo
- `GET http://localhost:3000/api/health`
- `GET http://localhost:3000/api/v1/example`

## Porta
- App unico: http://localhost:3000

## Padr?es adotados
- App Router
- TypeScript e ESLint
- `src/` como raiz de codigo
- API via Route Handlers em `src/app/api`

# Especificação do Projeto — Sistema de Agendamento de Reuniões (Next.js + Firebase)

> **Resumo executivo:** Aplicação web para usuários autenticados configurarem disponibilidade, criarem/gerenciarem reuniões sem conflito de agenda, visualizarem calendário (lista + mensal/semanal) e receberem confirmações/notificações.

---

## 1) Objetivo do Sistema

Construir um sistema de agendamento de reuniões onde:
- Usuários visualizam horários livres/ocupados (por disponibilidade configurada + reuniões existentes).
- Usuários criam reuniões escolhendo horários disponíveis.
- O sistema **bloqueia conflitos** (mesmo horário/intervalo).
- Criador (owner) edita/cancela.
- Participantes recebem convite/atualização.

---

## 2) Stack Obrigatória (Compliance)

### Frontend
- Next.js (App Router) + React + TypeScript
- TailwindCSS
- React Hook Form
- Zod
- Fetch API ou Axios
- date-fns ou Day.js

### Backend/Serviços
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting (opcional)
- Firebase Functions (opcional)
- Firebase Storage (opcional, anexos)

---

## 3) Escopo Funcional (MVP)

### 3.1 Autenticação
**Obrigatório**
- Login (email/senha)
- Cadastro (email/senha)
- Logout
- Proteção de rotas privadas
- Recuperação de senha

**Critérios de aceite**
- Rotas privadas redirecionam para `/login` quando não autenticado.
- Usuário autenticado cai no `/dashboard`.
- Reset de senha dispara e-mail do Firebase Auth.

---

### 3.2 Usuários e Perfil
**Obrigatório**
- Perfil: `name`, `email`, `photoUrl (opcional)`
- Configuração de disponibilidade por usuário

**Definição de disponibilidade (recomendado)**
- Disponibilidade recorrente por dia da semana + janelas de horário.
- Ex.: segunda: 09:00–12:00 e 14:00–18:00.

**Critérios de aceite**
- Usuário consegue criar/editar disponibilidade.
- Alterações refletem no calendário e no fluxo de agendamento.

---

### 3.3 Agendamento de Reuniões
**Obrigatório**
- Criar reunião com:
  - `title`
  - `description`
  - `date`
  - `startTime`
  - `endTime`
  - `participants[]` (lista de emails/uid)
- Seleção de horários disponíveis
- Evitar conflito de agenda
- Listagem de reuniões do usuário (como owner e/ou participante)
- Editar e cancelar

**Critérios de aceite**
- Sistema recusa criação/edição se houver sobreposição de horário.
- Apenas `ownerId` pode editar/cancelar.
- Participantes recebem “convite” no sistema (status).

---

### 3.4 Calendário
**Obrigatório**
- Visualização:
  - Lista (próximas reuniões)
  - Calendário mensal/semanal
- Destaque de horários ocupados e livres

**Critérios de aceite**
- Ao clicar num dia/slot, exibir reuniões e slots livres.
- Exibir reuniões do owner e das que participa.

---

### 3.5 Notificações
**Obrigatório**
- Confirmação após criação da reunião (toast + status na UI)

**Opcional**
- Envio de e-mail via Firebase Functions (trigger no Firestore)

**Critérios de aceite**
- Ações de criar/editar/cancelar geram feedback (loading/sucesso/erro).
- (Opcional) E-mails enviados para participantes.

---

## 4) Regras de Negócio (Hard Rules)

1. **Sem conflito:** usuário não pode agendar em horário já ocupado (owner) e/ou reservado por outra reunião.
2. **Owner manda:** somente criador pode editar/cancelar.
3. **Participantes convidados:** participantes têm status (ex.: `invited/accepted/declined`).
4. **Disponibilidade configurável:** horários disponíveis são definidos pelo usuário e validados no agendamento.

> **Definição de conflito (overlap):**
- Conflito ocorre se: `startA < endB` **e** `endA > startB` no mesmo dia.
- Considerar timezone e normalização de data/hora.

---

## 5) Modelagem de Dados (Firestore)

### 5.1 Collections

#### `users/{uid}`
Campos:
- `name: string`
- `email: string`
- `photoUrl?: string`
- `availability: AvailabilityRule[]`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

Tipo sugerido:
```ts
type AvailabilityRule = {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Domingo
  windows: Array<{ start: string; end: string }>; // "09:00", "18:00"
  enabled: boolean;
}
```

#### `meetings/{meetingId}`
Campos:
- `title: string`
- `description?: string`
- `date: string` (ISO `YYYY-MM-DD`)
- `startTime: string` (`HH:mm`)
- `endTime: string` (`HH:mm`)
- `ownerId: string` (uid)
- `participants: Participant[]`
- `status: "scheduled" | "cancelled"`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

Tipo sugerido:
```ts
type Participant = {
  uid?: string;      // se já é usuário do sistema
  email: string;
  status: "invited" | "accepted" | "declined";
}
```

### 5.2 Índices recomendados (Firestore)
- `meetings`:
  - `ownerId + date`
  - `participants.email + date` (alternativa: manter array de `participantEmails` para query)
  - `ownerId + status + date`

> **Obs:** Firestore tem limites de queries em arrays; estratégia comum:
- Campo redundante: `participantEmails: string[]` para `array-contains`.

---

## 6) Segurança (Firestore Rules) — Obrigatório

**Diretriz**
- Usuário só lê/escreve seu documento em `users/{uid}`.
- Reuniões:
  - Leitura permitida se `request.auth.uid == ownerId` **ou** usuário está em `participantEmails`.
  - Escrita:
    - Criar: `ownerId == request.auth.uid`
    - Editar/cancelar: apenas owner
- Validar payload mínimo e tipos básicos nas Rules (quando viável).

> **Importante:** Conflito de agenda com consistência forte é melhor feito via **transaction** ou **Cloud Function**. No MVP, usar transaction no client e regras para reduzir risco.

---

## 7) Arquitetura de Aplicação (Next.js App Router)

### 7.1 Páginas
- `/login`
- `/register`
- `/dashboard` (home pós login)
- `/calendar`
- `/meetings`
  - `/meetings/new`
  - `/meetings/[id]` (detalhe)
  - `/meetings/[id]/edit`
- `/profile`

### 7.2 Estrutura Sugerida
```
/app
  /(auth)
    /login
    /register
  /(private)
    /dashboard
    /calendar
    /meetings
    /profile
/components
  /ui
  /calendar
  /meetings
  /forms
/services
  auth.service.ts
  users.service.ts
  meetings.service.ts
/lib
  /firebase
    client.ts
    admin.ts (se usar admin SDK em server actions/functions)
  zod-schemas.ts
/hooks
  useAuth.ts
  useMeetings.ts
  useAvailability.ts
/types
  user.ts
  meeting.ts
/utils
  date.ts
  overlap.ts
  firestore.ts
/middleware.ts
```

---

## 8) Fluxos Principais (End-to-End)

### 8.1 Cadastro/Login
1. Usuário cria conta com email/senha
2. Após criar: cria doc em `users/{uid}` com `createdAt`
3. Redireciona para `/dashboard`

### 8.2 Configurar Disponibilidade
1. Usuário acessa `/profile`
2. Define janelas por dia da semana
3. Salva em `users/{uid}.availability`

### 8.3 Criar Reunião
1. Usuário acessa `/meetings/new`
2. Seleciona data e horário dentro da disponibilidade
3. Sistema valida:
   - Form (Zod)
   - Disponibilidade (client)
   - Conflito (Firestore transaction)
4. Cria doc em `meetings`
5. UI confirma + exibe em calendário/lista

### 8.4 Editar/Cancelar
- Editar: repetir validações e garantir owner
- Cancelar: setar `status = "cancelled"` (evitar delete para auditoria)

---

## 9) Validações (Zod) — Obrigatório

Regras:
- `title` obrigatório, min 3
- `date` formato `YYYY-MM-DD`
- `startTime/endTime` formato `HH:mm`
- `endTime` > `startTime`
- `participants` lista de emails válidos (pode ser vazia no MVP, mas recomendado >=1)

---

## 10) Tratamento de Datas e Timezone

**Padrão**
- Persistir `date` como `YYYY-MM-DD` e horários como `HH:mm`.
- Na UI, usar date-fns/Day.js com timezone do usuário.
- Para comparações, converter para “minutos do dia”:
  - `startMinutes = HH*60 + mm`
  - `endMinutes = HH*60 + mm`

Isso reduz bug sutil de timezone, porque a regra de conflito é local ao dia.

---

## 11) Estratégia Anti-Conflito (Pioneira, mas prática)

### Opção A (MVP, client transaction)
- Antes de gravar, buscar reuniões do owner no dia (query `ownerId + date`).
- Validar overlap.
- Gravar em **transaction** para reduzir race condition.

### Opção B (robusta, recomendada)
- Criar documento de “slot lock”:
  - `locks/{ownerId}_{date}_{startTime}_{endTime}` (ou granularidade 15 min)
- Criar locks em batch/transaction.
- Se lock já existir, recusar.
- Isso dá previsibilidade, escala e reduz o “dois cliques ao mesmo tempo”.

> Para o Codex: implementar Opção A no MVP e deixar Opção B como upgrade.

---

## 12) UI/UX (Tailwind)

**Diretrizes**
- Layout responsivo
- Dashboard minimalista (cards: próximas reuniões, atalhos)
- Sidebar ou topbar
- Estados: loading, empty state, erro, sucesso

**Componentes sugeridos**
- `Toast`/`Alert`
- `Modal` para confirmar cancelamento
- `CalendarGrid` (mensal/semanal)
- `MeetingForm` (RHF + Zod)
- `AvailabilityEditor` (dias + janelas)

---

## 13) Requisitos Técnicos (Qualidade)

- Componentização e reuso
- Clean Code (nomes claros, funções curtas)
- Services isolados para Firebase
- Tipagem forte (TypeScript)
- Hooks para regras de negócio no client (ex.: `useAvailability`, `useMeetings`)
- Logs e erros amigáveis

---

## 14) Diferenciais Opcionais (Backlog Visionário)

1. **Link público de agendamento**
   - `/book/[username]` com disponibilidade pública limitada
2. **Integração Google Calendar**
   - OAuth + sync (apenas se necessário)
3. **Busca e filtros**
   - por data, status, participante
4. **Dark mode**
5. **Permissões**
   - admin vs usuário (ex.: admin gerencia usuários do tenant)
6. **Anexos**
   - Firebase Storage por reunião

---

## 15) Entregáveis e Critérios de Conclusão

### MVP completo quando:
- Auth funcionando + rotas privadas
- Perfil + disponibilidade persistida
- CRUD de reuniões com anti-conflito
- Calendário (lista + mensal/semanal)
- Feedback de ações (loading/sucesso/erro)
- Firestore Rules aplicadas e testadas

---

## 16) Plano de Testes (mínimo)

### Unit (utils)
- `overlap(a, b)` com casos de borda
- `timeToMinutes("HH:mm")`

### Integration (services)
- criar reunião em dia sem conflito
- bloquear conflito
- bloquear edição por não-owner

### UI
- fluxo login/cadastro
- criar reunião e ver na lista/calendário

---

## 17) Variáveis de Ambiente

Next.js:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

(Se usar Admin SDK em server-side)
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

---

## 18) Instruções Diretas para o Codex (modo execução)

1. Criar projeto Next.js com App Router + TS + Tailwind.
2. Configurar Firebase (client SDK) e Auth.
3. Implementar provider/hook de auth + proteção de rotas (middleware ou layout private).
4. Implementar Firestore:
   - `users.service.ts` (get/update profile + availability)
   - `meetings.service.ts` (list/create/update/cancel + anti-conflito)
5. Construir páginas do App Router conforme estrutura.
6. Implementar formulários com RHF + Zod.
7. Implementar calendário mensal/semanal e lista.
8. Implementar UI states e toasts.
9. Implementar Firestore Rules (arquivo `firestore.rules`).
10. (Opcional) Functions para e-mail/convites.

> Padrão de commit mental: entregar sempre com tipagem, validação e regras básicas prontas. Sem gambiarra “só pra funcionar”.

---

## 19) Observações de Produto (para não virar um Frankenstein)

- Cancelamento deve ser “soft delete” (status), para histórico.
- Participantes por email resolvem 80% do problema. Mapear para uid quando existir.
- Timezone é o tipo de detalhe que quebra reputação rápido — normalize cedo.
- Anti-conflito: transaction no MVP, lock docs no upgrade.

---

**Fim da especificação.**

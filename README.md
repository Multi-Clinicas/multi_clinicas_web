# 🚀 MultiClínicas - Frontend (Web)

Este é o repositório da interface Web (Frontend) do sistema **MultiClínicas**, construída com **Next.js**. O sistema é **Multi-Tenant** (várias clínicas rodam no mesmo sistema, separadas por subdomínio), o que exige algumas configurações específicas para rodar localmente.

---

## 🛠️ 1. Como rodar o projeto localmente

Para que o frontend funcione completamente, é necessário que a API (Backend) e o Banco de Dados estejam rodando.

### Passo A: Subir o Banco de Dados
No repositório principal/backend, certifique-se de subir o PostgreSQL usando o Docker:
```bash
docker-compose up -d
```

### Passo B: Rodar o Backend (API)
A API Spring Boot deve estar rodando na porta `8080`.
```bash
# Na pasta da API
./mvnw spring-boot:run
```

### Passo C: Rodar o Frontend (Este Repositório)
O frontend precisa do Node.js instalado. Ele vai rodar na porta `3000`.
```bash
npm install
npm run dev
```

---

## 🌐 2. Configuração do arquivo `hosts` (MUITO IMPORTANTE)

Como o nosso sistema é Multi-Tenant, ele identifica qual clínica está sendo acessada através da URL (ex: `clinica-vida.localhost:3000`). Para que o seu computador entenda que `clinica-vida.localhost` deve apontar para o seu frontend local, precisamos editar o arquivo `hosts` do sistema operacional.

**No Windows:**
Abra o Bloco de Notas **como Administrador** e edite o arquivo: `C:\Windows\System32\drivers\etc\hosts`

**No Mac/Linux:**
Abra o terminal e digite: `sudo nano /etc/hosts`

**Adicione as seguintes linhas ao final do arquivo:**
```text
127.0.0.1   localhost
127.0.0.1   clinica-vida.localhost
127.0.0.1   sua-outra-clinica.localhost
```
*Obs: Adicione o subdomínio correspondente sempre que for testar uma clínica nova que você criar no painel.*

---

## 🗺️ 3. Divisão de Rotas (Os 3 Pilares do Sistema)

O frontend foi projetado para se comportar como 3 sistemas diferentes dependendo da URL que você acessa:

### 🏢 Pilar 1: Plataforma "Mãe" (SaaS / Super Admin)
Onde o dono do software entra para gerenciar as assinaturas das clínicas.
*   **Domínio:** `http://localhost:3000` (Mostra a Landing Page de venda do nosso software).
*   **Login Master:** `http://localhost:3000/admin-login`
*   **Painel:** `http://localhost:3000/admin/clinicas` (Para cadastrar as clínicas e gerar os subdomínios).

### 🩺 Pilar 2: Backoffice da Clínica (Recepção e Médicos)
Área restrita de gestão de uma clínica específica. A interface é um "Open Canvas" lateral.
*   **Domínio:** `http://clinica-vida.localhost:3000/login`
*   **Painel:** `http://clinica-vida.localhost:3000/backoffice` (Agenda diária, gestão de médicos, planos de saúde e horários).

### 🧑‍⚕️ Pilar 3: Visão do Paciente (B2C)
Área focada em conversão mobile-first (parece um aplicativo no celular).
*   **Página Inicial:** `http://clinica-vida.localhost:3000/` (Catálogo dos médicos daquela clínica).
*   **Agendamento:** `http://clinica-vida.localhost:3000/agendamento` (Fluxo de escolha de data/hora).
*   **Área Logada:** `http://clinica-vida.localhost:3000/consultas` (Histórico de agendamentos).

---

## 🔑 4. Sistema de Logins e Credenciais

A API usa tokens JWT. O nosso front-end intercepta o subdomínio da URL e envia automaticamente o header `X-Clinic-ID` para o Java saber de qual clínica estamos falando.

Existem **3 níveis de acesso** no sistema:

### 1. Super Admin (Dono do Sistema)
*   **Onde logar:** `http://localhost:3000/admin-login`
*   **Credenciais padrão:** (Geradas automaticamente pela migration `V3` no Java)
    *   **Email:** `admin@multiclinicas.com`
    *   **Senha:** `123456`
*   *O que faz:* Cria as clínicas.

### 2. Admin da Clínica / Recepcionista
*   **Onde logar:** `http://[subdominio-da-clinica].localhost:3000/login`
*   **Credenciais:** Quando o Super Admin cria uma clínica, ele define o e-mail e senha do gestor daquela unidade no formulário. É com esse e-mail que vocês devem logar aqui.
*   *O que faz:* Acessa o `/backoffice`, cadastra médicos, horários, atende pacientes.

### 3. Pacientes
*   **Onde logar:** `http://[subdominio-da-clinica].localhost:3000/login`
*   **Credenciais:** O próprio paciente cria a sua conta acessando a rota `/cadastro` dentro do subdomínio da clínica.
*   *O que faz:* Marca consultas e vê seu próprio histórico.
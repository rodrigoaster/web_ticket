# TODO

## 🚀 Instalação

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/sistema-controle-atendimento.git
cd sistema-controle-atendimento
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Execute o projeto**
```bash
npm run dev
# ou
yarn dev
```

4. **Acesse no navegador**
```
http://localhost:5173
```

## 📁 Estrutura do Projeto

```
src/
├── App.tsx                    # Componente principal com todo o estado
├── main.tsx                   # Entry point
├── types/
│   └── index.ts              # Definições de tipos TypeScript (futuro)
└── utils/
    └── helpers.ts            # Funções auxiliares (futuro)
```

### Estrutura Atual (Arquivo Único)

Atualmente, todo o código está contido em um único arquivo `App.tsx` que inclui:

- Definições de tipos (Password, QueueStats, etc.)
- Funções auxiliares (generatePasswordNumber, getServiceTime, etc.)
- Lógica de negócio (issuePassword, callNextPassword)
- Componentes de view (TotemView, PanelView, AttendantView, ReportsView)
- Componente principal App

**Nota:** Esta estrutura será refatorada no futuro para melhor organização em múltiplos arquivos.

## 💡 Como Usar

### Para o Cliente (Totem)

1. Acesse a view "Totem"
2. Selecione o tipo de atendimento:
   - **SP**: Atendimento prioritário (idosos, gestantes, PCD)
   - **SG**: Atendimento geral
   - **SE**: Retirada de exames
3. Retire sua senha impressa
4. Aguarde a chamada no painel

### Para o Atendente

1. Acesse a view "Atendente"
2. Selecione seu guichê (botões +/-)
3. Clique em "Chamar Próxima Senha"
4. Atenda o cliente
5. Repita o processo

### Para Visualizar o Painel

1. Acesse a view "Painel"
2. Acompanhe as chamadas em tempo real
3. Display público para os clientes aguardando

### Para Gerar Relatórios

1. Acesse a view "Relatórios"
2. Visualize estatísticas em tempo real
3. Exporte relatórios (funcionalidade futura)

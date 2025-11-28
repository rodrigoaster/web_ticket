# 🏥 Sistema de Controle de Atendimento - Laboratório Médico

Sistema de gestão de filas e tickets para laboratórios médicos, desenvolvido como projeto acadêmico da UNINASSAU. O sistema gerencia três tipos de senhas com priorização inteligente e alternância automática para garantir atendimento justo e eficiente.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Regras de Negócio](#regras-de-negócio)
- [Instalação](#instalação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Usar](#como-usar)
- [Especificações Técnicas](#especificações-técnicas)
- [Roadmap](#roadmap)

## 🎯 Visão Geral

O sistema trabalha com três agentes principais:

- **AS (Agente Sistema)**: Emite senhas e processa comandos
- **AA (Agente Atendente)**: Gerencia chamadas e realiza atendimentos nos guichês
- **AC (Agente Cliente)**: Retira senhas no totem e aguarda atendimento

## ✨ Funcionalidades

### 🖥️ Quatro Interfaces Principais

#### 1. **Totem de Atendimento**
- Emissão de senhas por categoria (SP, SG, SE)
- Contador de pessoas aguardando em tempo real
- Interface intuitiva e acessível

#### 2. **Painel de Chamadas**
- Exibição da senha sendo chamada atualmente (destaque)
- Histórico das 5 últimas chamadas
- Indicação do guichê de atendimento
- Visual de alto contraste para fácil visualização

#### 3. **Painel do Atendente**
- Botão para chamar próxima senha
- Seletor de guichê (múltiplos guichês)
- Visualização da fila por tipo de senha
- Contador de senhas aguardando

#### 4. **Relatórios**
- Estatísticas gerais (emitidas, atendidas, aguardando, descartadas)
- Relatórios por tipo de senha
- Histórico detalhado com timestamps
- Exportação de dados (futuro)

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Tipagem estática e segurança de tipos
- **Tailwind CSS** - Framework CSS utilitário para estilização
- **Lucide React** - Biblioteca de ícones

### Gerenciamento de Estado
- **React Hooks** - useState
- **Estado Local** - Gerenciamento centralizado no componente App

### Ferramentas de Desenvolvimento
- **Vite** (recomendado) - Build tool e dev server
- **ESLint** - Linting de código
- **Prettier** - Formatação de código

## 🏗️ Arquitetura

### Padrão de Projeto: Componente Único com Estado Local

```
App (Estado Centralizado)
├── Navigation (Seleção de View)
├── TotemView (Renderizado condicionalmente)
├── PanelView (Renderizado condicionalmente)
├── AttendantView (Renderizado condicionalmente)
└── ReportsView (Renderizado condicionalmente)
```

#### Fluxo de Dados

```typescript
App Component
    ↓
Estado Local (useState)
    ↓
Views Renderizadas Condicionalmente
```

### Estrutura Atual

O projeto utiliza um **componente único** (`App.tsx`) que gerencia todo o estado da aplicação através de React Hooks. As diferentes views (Totem, Painel, Atendente, Relatórios) são renderizadas condicionalmente dentro do mesmo componente, facilitando o compartilhamento de estado.

**Vantagens da abordagem atual:**
- ✅ Simplicidade e facilidade de entendimento
- ✅ Todo o estado em um único local
- ✅ Menos boilerplate code
- ✅ Ideal para projetos de médio porte

**Nota:** Uma versão futura com Context API está planejada para melhor separação de componentes e escalabilidade.

## 📐 Regras de Negócio

### Tipos de Senha

| Tipo | Descrição | Tempo Médio | Prioridade |
|------|-----------|-------------|------------|
| **SP** | Senha Prioritária | 15 min (±5 min) | Alta |
| **SG** | Senha Geral | 5 min (±3 min) | Baixa |
| **SE** | Retirada de Exames | <1 min (95%) / 5 min (5%) | Média* |

*A SE não tem prioridade formal, mas é atendida rapidamente devido ao tempo baixo.

### Lógica de Alternância

O sistema segue um padrão obrigatório de alternância:

```
[SP] → [SE ou SG] → [SP] → [SE ou SG] → ...
```

**Regras:**
1. Após atender SP, o sistema chama SE (se disponível) ou SG
2. Após atender SE ou SG, o sistema tenta chamar SP
3. Se não houver SP, chama SE ou SG
4. SE tem preferência sobre SG quando disponível

### Formato da Senha

```
YYMMDD-PPSQ

Exemplo: 251128-SP03
```

- **YY**: Ano (2 dígitos)
- **MM**: Mês (2 dígitos)
- **DD**: Dia (2 dígitos)
- **PP**: Tipo da senha (SP, SG, SE)
- **SQ**: Sequência diária (2 dígitos)

### Horário de Funcionamento

- **Início**: 7h
- **Término**: 17h
- Senhas não atendidas são descartadas ao fim do expediente

### Taxa de Não Comparecimento

**5%** de todas as senhas emitidas não são atendidas (simulação automática no sistema).

## 🔌 Estado e Funções

### Estado Principal da Aplicação

```typescript
// Estado de senhas e filas
const [passwords, setPasswords] = useState<Password[]>([]);
const [sequences, setSequences] = useState({ SP: 1, SG: 1, SE: 1 });
const [lastCalledType, setLastCalledType] = useState<PasswordType | null>(null);
const [recentCalls, setRecentCalls] = useState<Password[]>([]);

// Estado de UI
const [view, setView] = useState<'totem' | 'panel' | 'attendant' | 'reports'>('totem');
const [currentCounter, setCurrentCounter] = useState<number>(1);

// Estado de estatísticas
const [stats, setStats] = useState<QueueStats>({ /* ... */ });
```

### Funções Principais

| Função | Descrição |
|--------|-----------|
| `issuePassword(type)` | Emite uma nova senha do tipo especificado |
| `callNextPassword()` | Chama a próxima senha seguindo a lógica de alternância |
| `generatePasswordNumber(type, seq)` | Gera o número da senha no formato YYMMDD-PPSQ |
| `getServiceTime(type)` | Calcula o tempo de atendimento baseado no tipo |
| `getPasswordTypeLabel(type)` | Retorna o label descritivo do tipo de senha |
| `getPasswordColor(type)` | Retorna a cor Tailwind para o tipo de senha |

### Como Acessar o Estado

Como todo o estado está no componente `App`, as views são renderizadas condicionalmente dentro dele e têm acesso direto a todas as variáveis de estado e funções.

```typescript
// Exemplo dentro do App.tsx
const TotemView = () => {
  // Acesso direto ao estado e funções do escopo do App
  return (
    <button onClick={() => issuePassword('SP')}>
      Emitir Senha Prioritária
    </button>
  );
};
```

## 🔧 Especificações Técnicas

### Tipos de Dados

```typescript
type PasswordType = 'SP' | 'SG' | 'SE';

interface Password {
  id: string;
  type: PasswordType;
  number: string;
  issuedAt: Date;
  attendedAt?: Date;
  counter?: number;
  status: 'waiting' | 'called' | 'attended' | 'discarded';
}

interface QueueStats {
  totalIssued: number;
  totalAttended: number;
  byType: {
    SP: { issued: number; attended: number };
    SG: { issued: number; attended: number };
    SE: { issued: number; attended: number };
  };
}
```

### Algoritmo de Chamada

```typescript
// Pseudo-código simplificado
function callNextPassword() {
  if (ultimaChamada === SP) {
    chamar(SE || SG);
  } else {
    chamar(SP) || chamar(SE || SG);
  }
}
```

## 🎨 Customização

### Alterar Tempos de Atendimento

Edite a função `getServiceTime()` em `QueueProvider`:

```typescript
const getServiceTime = (type: PasswordType): number => {
  switch (type) {
    case 'SP':
      return (15 + (Math.random() * 10 - 5)) * 60 * 1000; // Modificar aqui
    // ...
  }
};
```

### Alterar Taxa de Não Comparecimento

Modifique a constante na função `issuePassword()`:

```typescript
if (Math.random() < 0.05) { // Alterar 0.05 para novo valor (0.1 = 10%)
  // ...
}
```

## 🚧 Roadmap

### Funcionalidades Planejadas

- [ ] **Context API** - Separação em componentes independentes para melhor escalabilidade
- [ ] Integração com backend (Node.js + MySQL)
- [ ] Autenticação de atendentes
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] Notificações sonoras no painel
- [ ] Impressão de senhas
- [ ] Dashboard administrativo
- [ ] Configuração de horários personalizados
- [ ] Suporte a múltiplos laboratórios
- [ ] API REST para integração com outros sistemas
- [ ] Aplicativo móvel para clientes

### Melhorias Técnicas

- [ ] **Refatoração para múltiplos arquivos** - Separar componentes, tipos e utilitários
- [ ] **Context API** - Implementar gerenciamento de estado global
- [ ] Testes unitários (Jest + Testing Library)
- [ ] Testes E2E (Cypress)
- [ ] PWA (Progressive Web App)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Acessibilidade (WCAG 2.1)
- [ ] Internacionalização (i18n)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**João Ferreira**  
UNINASSAU - 2025

## 📞 Contato

- Email: joao.ferreira@example.com
- LinkedIn: [linkedin.com/in/joaoferreira](https://linkedin.com/in/joaoferreira)
- GitHub: [@joaoferreira](https://github.com/joaoferreira)

## 🙏 Agradecimentos

- UNINASSAU pela oportunidade do projeto
- Professores e orientadores
- Comunidade React e TypeScript

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!

# Automação de Testes - Blocks QA

Projeto de automação de testes E2E (ponta a ponta) para o fluxo de cadastro de usuários da plataforma Blocks.

## Sobre o Projeto

Este projeto apresenta a implementação de uma estrutura de automação de testes de ponta a ponta (E2E) para fluxos de cadastro. O foco principal foi garantir a integridade do sistema através da validação rigorosa de cenários de sucesso e tratamento de erros.

**Página testada:** https://www.blocksrvt.com/pt/registrar

## Tecnologias Utilizadas

- **Cypress** v15.9.0 - Framework de automação de testes
- **Node.js** - Ambiente de execução JavaScript
- **Mochawesome Reporter** - Geração de relatórios HTML
- **JUnit Reporter** - Relatórios XML

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

- **cypress/e2e/** - Contém todos os testes automatizados:
  - `cadastroCompleto.cy.js` - Teste de cadastro com sucesso
  - `cadastroEmailInv.cy.js` - Testes com email inválido e email já em uso
  - `cadastroSemTermo.cy.js` - Teste sem aceitar política de privacidade
  - `cadastroSenhaDif.cy.js` - Teste com senhas diferentes

- **cypress/fixtures/** - Massa de dados para os testes:
  - `userData.json` - Perfis de usuários (válidos e inválidos)

- **cypress/reports/** - Relatórios gerados automaticamente após execução

- **cypress/screenshots/** - Screenshots capturados durante os testes

- **cypress/support/** - Configurações e comandos customizados:
  - `e2e.js` - Configurações globais

- **cypress.config.js** - Arquivo de configuração do Cypress

- **package.json** - Gerenciamento de dependências do projeto

## Cenários de Teste Implementados

### Cenário Positivo

1. **Cadastro com Sucesso**
   - Preenche todos os campos
   - Aceita a política de privacidade
   - Valida redirecionamento para página de login

### Cenários Negativos

2. **Email com Formato Inválido**
   - Valida mensagem de erro para email inválido
   - Verifica que botão de submit fica desabilitado
   - **BUG ENCONTRADO:** Mensagem em inglês mesmo com página em português
        - Comportamento verificado com página em espanhol e portugues.

3. **Email Já em Uso**
   - Valida mensagem de erro para email duplicado
   - Verifica que botão de submit fica desabilitado

4. **Cadastro Sem Aceitar Política de Privacidade**
   - Valida que formulário não é submetido
   - Verifica que botão de submit fica desabilitado

5. **Senhas Diferentes**
   - Valida mensagem de erro quando senhas não coincidem
   - Verifica que botão de submit fica desabilitado
   - **BUG ENCONTRADO:** Mensagem em inglês mesmo com página em português
        - Comportamento verificado com página em espanhol e portugues.

## Instalação

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/CintraB/qa-blocks.git
cd qa-blocks
```

2. Instale as dependências:
```bash
npm install
```

## Executando os Testes

### Modo Interativo (Cypress UI)

Abre a interface do Cypress para executar testes individualmente:

```bash
npm run cy:open:chrome
```

### Modo Headless (CI/CD)

Executa todos os testes em modo headless:

```bash
npm run cy:run:chrome
```
## Relatório Detalhado

O relatório completo de testes pode ser encontrado em:
- **Markdown:** `Relatorio_QA_Blocks/Cristhian_Cintra_Barbosa_Relatorio_QA_Blocks.md`
- **PDF:** `Relatorio_QA_Blocks/Cristhian_Cintra_Barbosa_Relatorio_QA_Blocks.pdf`

## Relatórios

Após a execução dos testes, os relatórios são gerados automaticamente:

- **HTML Report:** `cypress/reports/html/index.html`
  - Relatório visual com gráficos
  - Screenshots embutidos
  - Detalhamento de cada teste

- **JUnit XML:** `cypress/reports/junit/`
  - Formato compatível com ferramentas CI/CD

### Visualizar Relatório HTML

Abra o arquivo no navegador:
```bash
start cypress/reports/html/index.html
```

## Screenshots

Os testes capturam screenshots automaticamente em momentos-chave:
- Antes de submeter o formulário
- Após validações de erro
- Após cadastro bem-sucedido

Screenshots são salvos em: `cypress/screenshots/`

## Boas Práticas Aplicadas

- **Padrão AAA** (Arrange, Act, Assert) em todos os testes
- **Data-Driven Testing** com fixtures
- **Geração de emails únicos** usando timestamp
- **Seletores robustos** (IDs, atributos, hierarquia DOM)
- **Organização modular** (um arquivo por cenário)
- **Evidências visuais** com screenshots
- **Relatórios detalhados** para análise

## Resultados da Última Execução

```
Total de Testes: 5
Testes Aprovados: 5
Testes Falhados: 0
Taxa de Sucesso: 100%
Tempo Total: ~36 segundos
```

## Autor

**Cristhian Cintra Barbosa**


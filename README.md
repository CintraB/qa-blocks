# Automação de Testes - QA

Projeto de automação de testes E2E (ponta a ponta) para o fluxo de cadastro de usuários da plataforma Blocks.

## Sobre o Projeto

Este projeto demonstra minha experiência prática em automação de testes E2E, estruturação de frameworks QA e validação de qualidade em aplicações web.

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

- **cypress/idiomas/** - Testes de internacionalização (fora da suíte principal):
  - `idiomas.cy.js` - Valida textos no idioma da página em `/pt`, `/es` e `/en` (controle). Falhas hoje = bugs #01 a #04 e #06

- **cypress/fixtures/** - Massa de dados para os testes:
  - `userData.json` - Perfis de usuários (válidos e inválidos)

- **cypress/reports/** - Relatórios gerados automaticamente após execução (não versionados)

- **cypress/screenshots/** - Screenshots capturados durante os testes (não versionados)

- **cypress/support/** - Configurações e comandos customizados:
  - `e2e.js` - Configurações globais
  - `commands.js` - Comandos customizados reutilizados pelos testes:
    - `cy.abrirCadastro()` - Abre a página de cadastro e aceita os cookies
    - `cy.preencherCadastro(usuario, email)` - Preenche todos os campos do formulário (exceto o aceite da política)
    - `cy.aceitarPolitica()` - Marca o aceite da política de privacidade
    - `cy.aceitarCookies()` - Aceita o banner de cookies

- **Relatorio_QA_Blocks/** - Relatório de QA (`.md` e `.pdf`):
  - `evidencias/cypress/` - Screenshots da execução usada no relatório
  - `evidencias/idiomas/` - Screenshots dos testes de idioma
  - `evidencias/*.png` - Evidências do Bug #05 (resposta da API e artigos da LGPD, cada print com o link da fonte)

- **scripts/capturar-evidencias.js** - Gera as evidências do Bug #05 (`npm run evidencias`)

- **export-pdf.js** - Gera o PDF do relatório a partir do Markdown (`npm run export:pdf`)

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

## Bugs Encontrados

| ID | Bug | Severidade |
|----|-----|------------|
| #01 | Mensagem de email inválido em inglês na página em português/espanhol | Baixa |
| #02 | Mensagem de senhas diferentes em inglês na página em português/espanhol | Baixa |
| #03 | Títulos e botões em inglês ("Sign Up", "Log in") nas telas de cadastro e login | Baixa |
| #04 | Textos de login na tela de cadastro: botão "Entrar" / "Iniciar" / "Sign in" e título "Iniciar Sesión" (es) | Baixa |
| #05 | API de verificação de email expõe dados pessoais (IP, geolocalização, perfil) sem autenticação, com base legal na LGPD | **Alta** |
| #06 | Link "política de privacidade" em português na página em espanhol | Baixa |

Detalhes, evidências e embasamento legal no [relatório](Relatorio_QA_Blocks/Cristhian_Cintra_Barbosa_Relatorio_QA_Blocks.md).

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

Executa a suíte principal em modo headless:

```bash
npm test
```

(equivalente a `npm run cy:run:chrome`)

### Testes de Idioma

Executa a suíte de internacionalização (`cypress/idiomas/`). Ela valida o comportamento **esperado**, então hoje **10 dos 15 testes falham de propósito**: cada falha corresponde a um bug registrado no relatório. Quando os textos forem corrigidos pela Blocks, a suíte passa a ficar verde.

```bash
npm run test:idiomas
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

As pastas `cypress/reports/` e `cypress/screenshots/` não são versionadas, pois mudam a cada execução. As evidências usadas no relatório ficam em `Relatorio_QA_Blocks/evidencias/`.

## Gerar o Relatório em PDF

```bash
npm run evidencias -- <email de uma conta criada pela própria suíte>   # opcional: recaptura as evidências do Bug #05
npm run export:pdf
```

## Boas Práticas Aplicadas

- **Padrão AAA** (Arrange, Act, Assert) em todos os testes
- **Data-Driven Testing** com fixtures
- **Geração de emails únicos** usando timestamp
- **Seletores robustos** (IDs, atributos, hierarquia DOM)
- **Organização modular** (um arquivo por cenário)
- **Comandos customizados** para evitar repetição do fluxo de preenchimento
- **`baseUrl` configurada** no `cypress.config.js`, sem URLs fixas nos testes
- **Sem esperas fixas** (`cy.wait(ms)`): os testes esperam a requisição de verificação de email (`cy.intercept`) ou a renderização do elemento
- **Testes independentes de dados externos**: o cenário de email já em uso cadastra o próprio email antes de validar
- **Evidências visuais** com screenshots
- **Relatórios detalhados** para análise

## Resultados da Última Execução

```
Data: 26/09/2026
Total de Testes: 5
Testes Aprovados: 5
Testes Falhados: 0
Taxa de Sucesso: 100%
Tempo Total: ~32 segundos
```

## Autor

**Cristhian Cintra Barbosa**


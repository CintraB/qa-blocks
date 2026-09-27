# Relatório de Testes Automatizados - Blocks

## Informações do Projeto

| Campo | Descrição |
|-------|-----------|
| **Projeto** | Blocks - Página de Cadastro de Usuários |
| **URL** | https://www.blocksrvt.com/pt/registrar |
| **Autor** | Cristhian Cintra Barbosa |
| **Ferramenta** | Cypress v15.9.0 |
| **Data** | 22/01/2026 |
| **Última reexecução** | 26/09/2026 |

---

## 1. Objetivo do Relatório

Este relatório tem como objetivo apresentar e documentar os resultados dos testes automatizados realizados no fluxo de cadastro de usuários da plataforma Blocks, bem como registrar análises de qualidade, riscos e pontos de melhoria identificados durante a execução dos testes.

---

## 2. Escopo dos Testes

Os testes foram executados exclusivamente no fluxo de cadastro via interface web, não contemplando testes de performance, segurança, acessibilidade ou integração com APIs externas.

> Na reexecução de 26/09/2026, um problema de segurança/privacidade foi identificado de forma **incidental**, ao observar a requisição que o próprio formulário faz para validar o email (ver Bug #05). Não foram realizados testes de segurança além dessa observação.

Os testes cobriram os seguintes aspectos:

- Fluxo de cadastro de usuários
- Validação de formulário
- Cenários positivos e negativos
- Mensagens de erro
- Comportamento do botão de submissão

---

## 3. Estratégia de Testes

A estratégia adotada foi de **testes E2E (End-to-End) automatizados**, simulando o comportamento real do usuário final.

### Principais Abordagens:

- **Testes independentes por cenário** - Cada teste executa de forma isolada
- **Uso de massa de dados via fixtures** - Dados organizados e reutilizáveis
- **Geração dinâmica de dados únicos** - Emails com timestamp para evitar duplicação
- **Validação de comportamento e feedback visual** - Screenshots e assertions

---

## 4. Cenários Executados

| ID | Cenário | Tipo | Resultado |
|----|---------|------|-----------|
| **CT-01** | Cadastro de usuário com sucesso | Positivo | Passou |
| **CT-02** | Cadastro com email inválido | Negativo | Passou |
| **CT-03** | Cadastro com email duplicado | Negativo | Passou |
| **CT-04** | Cadastro sem aceitar política de privacidade | Negativo | Passou |
| **CT-05** | Cadastro com senhas diferentes | Negativo | Passou |

### Cenário de Teste CT-01 - Cadastro de usuário com sucesso

- História do usuário:
    - Como um usuário que deseja acessar a plataforma Blocks, quero realizar meu cadastro preenchendo corretamente as informações obrigatórias. Para que eu possa utilizar as funcionalidades da plataforma.

- Critérios de Aceite Validados:
    - Preenchimento de todos os campos obrigatórios
    - Aceite da política de privacidade
    - Submissão bem-sucedida do formulário
    - Redirecionamento para a página de login

**Resultado:** Passou

Evidências:
- `Relatorio_QA_Blocks/evidencias/cypress/cadastroCompleto.cy.js/cadastroCompleto.png` e `Relatorio_QA_Blocks/evidencias/cypress/cadastroCompleto.cy.js/aposCadastro.png`

### Cenário de Teste CT-02 - Cadastro com email inválido

- História do usuário:
    - Como um usuário quero ser informado quando adicionar um email inválido, para que eu possa corrigir o dado e concluir meu cadastro corretamente.

- Critérios de Aceite Validados:
    - Detecção de formato de email inválido
    - Exibição de mensagem de erro de validação
    - Bloqueio da submissão do formulário

**Resultado:** Passou

Evidências:
- `Relatorio_QA_Blocks/evidencias/cypress/cadastroEmailInv.cy.js/cadastroInvalido.png` e `Relatorio_QA_Blocks/evidencias/cypress/cadastroEmailInv.cy.js/aposcadastroInvalido.png`

### Cenário de Teste CT-03 - Cadastro com email duplicado

- História do usuário:
    - Como um usuário quero ser informado quando adicionar um email já em uso, para que eu possa corrigir o dado e concluir meu cadastro corretamente.

- Critérios de Aceite Validados:
    - Detecção de email duplicado
    - Exibição de mensagem de erro
    - Bloqueio da submissão do formulário

**Resultado:** Passou

Evidências:
- `Relatorio_QA_Blocks/evidencias/cypress/cadastroEmailInv.cy.js/emailjaUsado.png` e `Relatorio_QA_Blocks/evidencias/cypress/cadastroEmailInv.cy.js/aposEmailjaUsado.png`

### Cenário de Teste CT-04 - Cadastro sem aceitar política de privacidade

- História de usuário:
    - Como um usuário quero tentar me cadastrar na plataforma Blocks sem aceitar a política de privacidade, para entender quais ações serão necessárias para concluir meu cadastro.

- Critérios de Aceite Validados:
    - Detecção da ausência de aceite da política de privacidade
    - Bloqueio da submissão do formulário

**Resultado:** Passou

Evidências:
- `Relatorio_QA_Blocks/evidencias/cypress/cadastroSemTermo.cy.js/cadastroSemTermo.png` e `Relatorio_QA_Blocks/evidencias/cypress/cadastroSemTermo.cy.js/aposCadastroSemTermo.png`

## Observação de Experiência do Usuário (Sugestão de Melhoria)

Durante a execução do teste, foi observado que ao não aceitar a política de privacidade, o botão de submissão permanece desabilitado, impedindo o cadastro.
No entanto, não há feedback visual ou mensagem informativa indicando ao usuário o motivo do bloqueio.

**Sugestão:** Exibir uma mensagem de orientação (ex: "É necessário aceitar a política de privacidade para continuar") ou um destaque visual no campo correspondente, a fim de melhorar a clareza e a experiência do usuário.

**Classificação:**
- Tipo: Sugestão de Melhoria / UX
- Severidade: Não se aplica
- Impacto: Experiência do usuário

A ausência de feedback visual pode gerar dúvidas ao usuário, principalmente em seu primeiro contato com a plataforma, aumentando o risco de abandono do fluxo.

### Cenário de Teste CT-05 - Cadastro com senhas diferentes

- História do usuário:
    - Como um usuário quero ser informado quando adicionar senhas diferentes, para que eu possa corrigir a informação e concluir meu cadastro corretamente.

- Critérios de Aceite Validados:
    - Detecção de senhas diferentes
    - Exibição de mensagem de erro de validação
    - Bloqueio da submissão do formulário

**Resultado:** Passou

Evidências:
- `Relatorio_QA_Blocks/evidencias/cypress/cadastroSenhaDif.cy.js/cadastroSenhaDif.png` e `Relatorio_QA_Blocks/evidencias/cypress/cadastroSenhaDif.cy.js/aposCadastroSenhaDif.png`

---

## 5. Resultados Gerais da Execução

```
Resumo da Execução
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total de Testes:     5
Testes Aprovados:    5
Testes Reprovados:   0
Taxa de Sucesso:     100%
Tempo Total:         ~36 segundos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Reexecução - 26/09/2026

A suíte foi executada novamente para verificar se continuava válida diante de mudanças no site.

**Manutenção necessária:** o texto do botão do banner de cookies mudou de "Permitir todos" para "Aceitar todos", o que fazia todos os cenários falharem logo na abertura da página. O clique foi centralizado no comando customizado `cy.aceitarCookies()` (`cypress/support/commands.js`), de forma que uma nova mudança de texto exija ajuste em um único ponto.

**Outras mudanças observadas no formulário** (sem impacto nos testes):
- Nova opção "Educação" em "Qual sua área de atuação?"
- Novo estilo visual do botão de submissão

```
Resumo da Reexecução (26/09/2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total de Testes:     5
Testes Aprovados:    5
Testes Reprovados:   0
Taxa de Sucesso:     100%
Tempo Total:         ~32 segundos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

As evidências (screenshots) deste relatório são da reexecução de 26/09/2026.

### Testes de Idioma (`npm run test:idiomas`)

Suíte separada (`cypress/idiomas/idiomas.cy.js`) que valida o comportamento **esperado** de internacionalização da página de cadastro em português, espanhol e inglês. A página em inglês funciona como **controle**. Os testes que falham hoje são a prova automatizada dos bugs e devem passar quando os textos forem corrigidos; por isso a suíte fica fora da execução principal (`npm test`).

| Verificação | `/pt` | `/es` | `/en` (controle) |
|-------------|-------|-------|------------------|
| Mensagem de email inválido no idioma da página (Bug #01) | Falhou | Falhou | Passou |
| Mensagem de senhas diferentes no idioma da página (Bug #02) | Falhou | Falhou | Passou |
| Título no idioma da página e sem texto de login (Bugs #03 e #04) | Falhou ("Sign Up") | Falhou ("Iniciar Sesión") | Passou |
| Botão de cadastro sem texto de login (Bug #04) | Falhou ("Entrar") | Falhou ("Iniciar") | Falhou ("Sign in") |
| Link da política no idioma da página (Bug #06) | Passou | Falhou ("política de privacidade") | Passou |

```
Resumo dos Testes de Idioma (26/09/2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total de Testes:     15
Aprovados:           5
Reprovados:          10 (todos correspondem a bugs registrados)
Tempo Total:         ~33 segundos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 6. Bugs Identificados

### Bug #01 - Internacionalização (Email Inválido)

| Campo | Detalhes |
|-------|----------|
| **Descrição** | Mensagem de validação de email inválido aparece em inglês ("This is not a valid email.") mesmo quando a página está configurada em português |
| **Ambiente** | Página localizada em português (`/pt/registrar`) e espanhol (`/es/registrar`) |
| **Localização** | Campo de email do formulário de cadastro |
| **Comportamento Atual** | Mensagem exibida: "This is not a valid email." |
| **Comportamento Esperado** | Mensagem em português: "Este não é um e-mail válido." |
| **Severidade** | Baixa |
| **Impacto** | Experiência do usuário - Inconsistência de idioma |
| **Status** | Identificado; confirmado automaticamente em `/pt` e `/es` pelo teste de idiomas (26/09/2026) |
| **Evidência** | `Relatorio_QA_Blocks/evidencias/cypress/cadastroEmailInv.cy.js/cadastroInvalido.png`, `Relatorio_QA_Blocks/evidencias/idiomas/idioma-pt-email-invalido.png` e `Relatorio_QA_Blocks/evidencias/idiomas/idioma-es-email-invalido.png` |

### Bug #02 - Internacionalização (Senhas Diferentes)

| Campo | Detalhes |
|-------|----------|
| **Descrição** | Mensagem de validação de senhas diferentes aparece em inglês ("Passwords must match") mesmo quando a página está configurada em português |
| **Ambiente** | Página localizada em português (`/pt/registrar`) e espanhol (`/es/registrar`) |
| **Localização** | Campo de confirmação de senha do formulário de cadastro |
| **Comportamento Atual** | Mensagem exibida: "Passwords must match" |
| **Comportamento Esperado** | Mensagem em português: "As senhas devem coincidir" |
| **Severidade** | Baixa |
| **Impacto** | Experiência do usuário - Inconsistência de idioma |
| **Status** | Identificado; confirmado automaticamente em `/pt` e `/es` pelo teste de idiomas (26/09/2026) |
| **Evidência** | `Relatorio_QA_Blocks/evidencias/cypress/cadastroSenhaDif.cy.js/cadastroSenhaDif.png`, `Relatorio_QA_Blocks/evidencias/idiomas/idioma-pt-senhas-diferentes.png` e `Relatorio_QA_Blocks/evidencias/idiomas/idioma-es-senhas-diferentes.png` |

### Bug #03 - Internacionalização (Títulos e Botões em Inglês)

| Campo | Detalhes |
|-------|----------|
| **Descrição** | Títulos e botões das telas de cadastro e login aparecem em inglês mesmo com a página em português |
| **Ambiente** | Página localizada em português (`/pt/registrar` e `/pt/login`) |
| **Localização** | Título do formulário de cadastro, link "Já possui uma conta?" e título/botão da tela de login |
| **Comportamento Atual** | Textos exibidos: "Sign Up" (título do cadastro) e "Log in" (link do cadastro, título e botão do login) |
| **Comportamento Esperado** | Textos em português, ex: "Cadastro" / "Criar conta" e "Entrar" |
| **Severidade** | Baixa |
| **Impacto** | Experiência do usuário - Inconsistência de idioma |
| **Status** | Identificado (reexecução de 26/09/2026; comportamento já presente em 22/01/2026) |
| **Evidência** | `Relatorio_QA_Blocks/evidencias/cypress/cadastroCompleto.cy.js/cadastroCompleto.png` e `Relatorio_QA_Blocks/evidencias/cypress/cadastroCompleto.cy.js/aposCadastro.png` |

### Bug #04 - Textos de Login na Tela de Cadastro

| Campo | Detalhes |
|-------|----------|
| **Descrição** | A tela de cadastro usa textos da ação de login (entrar) no botão de submissão, nos três idiomas, e no título da página em espanhol |
| **Ambiente** | Páginas `/pt/registrar`, `/es/registrarse` e `/en/register` |
| **Localização** | Botão de submissão do formulário de cadastro e título do formulário (`/es`) |
| **Comportamento Atual** | Botão: "Entrar" (`/pt`), "Iniciar" (`/es`) e "Sign in" (`/en`). Título em `/es`: "Iniciar Sesión" |
| **Comportamento Esperado** | Textos que descrevam a ação de cadastro, ex: "Cadastrar" / "Criar conta", "Registrarse" / "Crear cuenta" e "Sign up" / "Create account" |
| **Severidade** | Baixa |
| **Impacto** | Experiência do usuário - o usuário pode entender que está na tela de login |
| **Status** | Identificado (em `/pt` desde 22/01/2026; `/es` e `/en` confirmados pelo teste de idiomas em 26/09/2026) |
| **Evidência** | `Relatorio_QA_Blocks/evidencias/idiomas/idioma-pt-titulo-e-botao.png`, `idioma-es-titulo-e-botao.png` e `idioma-en-titulo-e-botao.png` |

### Bug #05 - Segurança / Privacidade (Exposição de Dados Pessoais pela API de Verificação de Email)

| Campo | Detalhes |
|-------|----------|
| **Descrição** | A API consultada pelo formulário para verificar se o email já está em uso responde, **sem autenticação**, com dados pessoais do titular da conta em vez de apenas indicar se o email existe |
| **Ambiente** | API `https://api.blocksrvt.com/v1/user/email/<email>` (chamada pela página `/pt/registrar` ao digitar o email) |
| **Localização** | Verificação de disponibilidade do campo de email do formulário de cadastro |
| **Comportamento Atual** | Para um email cadastrado, a resposta é `HTTP 200` com: identificador interno (`id`), `locale`, `country`, **endereço IP**, **geolocalização do IP** (cidade, CEP, região, latitude e longitude), provedor/ASN da conexão, fuso horário, datas de cadastro e de aceite dos termos, área de atuação, origem do cadastro, situação de estudante e se a conta é premium |
| **Comportamento Esperado** | Responder apenas se o email está disponível (ex: `{ "available": false }`), sem retornar dados do titular, e com proteção contra consultas em massa (ex: limite de requisições) |
| **Severidade** | **Alta** |
| **Impacto** | Privacidade e conformidade com a LGPD: qualquer pessoa pode (1) descobrir se um email possui conta na Blocks (enumeração de usuários) e (2) obter dados pessoais do titular, incluindo IP e localização aproximada |
| **Status** | Identificado em 26/09/2026 |
| **Evidência** | `Relatorio_QA_Blocks/evidencias/bug05-api-resposta-mascarada.png` |

**Como foi identificado:** durante a manutenção da suíte, ao investigar a espera fixa `cy.wait(500)` após digitar o email, foi observado que a página faz uma requisição `GET` à API acima para validar o email. A verificação foi feita **somente com uma conta criada pela própria suíte de testes** (CT-01, email `teste1790470745345@gmail.com`), sem acessar dados de terceiros e sem nenhuma exploração além da observação da resposta.

**Evidência (resposta real da API):** os valores pessoais foram mascarados e os grupos sem dado pessoal (moeda, dados do país, idioma, continente, segurança e fuso horário) foram recolhidos na própria captura. Os nomes dos campos pessoais estão destacados em amarelo.

![Bug #05 - Resposta da API com dados pessoais (mascarados)](evidencias/bug05-api-resposta-mascarada.png)

#### Embasamento legal - Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)

Fonte oficial: [https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

| Dispositivo | Texto da lei | Relação com o achado |
|-------------|--------------|----------------------|
| **Art. 5º, I** | "dado pessoal: informação relacionada a pessoa natural identificada ou identificável;" | Email, IP, geolocalização e identificador da conta são informações relacionadas a uma pessoa natural identificável, portanto dados pessoais |
| **Art. 6º, III** | "necessidade: limitação do tratamento ao mínimo necessário para a realização de suas finalidades, com abrangência dos dados pertinentes, proporcionais e não excessivos em relação às finalidades do tratamento de dados;" | Para informar se um email está disponível, basta um sim/não; devolver IP, localização e perfil da conta excede o necessário |
| **Art. 6º, VII** | "segurança: utilização de medidas técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou difusão;" | A rota não exige autenticação, permitindo o acesso de qualquer pessoa aos dados |
| **Art. 6º, VIII** | "prevenção: adoção de medidas para prevenir a ocorrência de danos em virtude do tratamento de dados pessoais;" | A exposição facilita enumeração de contas e uso dos dados para golpes direcionados (ex: phishing com dados reais do usuário) |
| **Art. 46** | "Os agentes de tratamento devem adotar medidas de segurança, técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou qualquer forma de tratamento inadequado ou ilícito." | Obrigação legal de proteger os dados contra acessos não autorizados, que não é atendida pela rota pública |

Complemento - página oficial do Governo Federal sobre a LGPD: [https://www.gov.br/mds/pt-br/acesso-a-informacao/governanca/integridade/campanhas/lgpd](https://www.gov.br/mds/pt-br/acesso-a-informacao/governanca/integridade/campanhas/lgpd), que define: *"O dado pessoal é aquele que possibilita a identificação, direta ou indireta, da pessoa natural. São exemplos de dados pessoais: nome e sobrenome; data e local de nascimento; RG; CPF; retrato em fotografia; endereço residencial; endereço de e-mail; dentre outros."* e lista, entre os princípios da LGPD, **Necessidade**, **Segurança** e **Prevenção**.

> **Observação:** este relatório aponta uma não conformidade técnica com base no texto da lei; a caracterização jurídica definitiva (ex: se configura incidente de segurança nos termos do Art. 48) cabe ao encarregado de dados (DPO) e à assessoria jurídica da Blocks.

**Prints das fontes (capturados em 26/09/2026, com o link de origem no topo de cada imagem):**

![LGPD - Art. 5º, I - definição de dado pessoal (planalto.gov.br)](evidencias/lgpd-art5-dado-pessoal.png)

![LGPD - Art. 6º, incisos III, VII e VIII - princípios (planalto.gov.br)](evidencias/lgpd-art6-principios.png)

![LGPD - Art. 46 - medidas de segurança (planalto.gov.br)](evidencias/lgpd-art46-seguranca.png)

![Página LGPD do Governo Federal - princípios e definição de dado pessoal (gov.br)](evidencias/govbr-lgpd-principios-e-dado-pessoal.png)

### Bug #06 - Internacionalização (Link da Política de Privacidade em Português na Página em Espanhol)

| Campo | Detalhes |
|-------|----------|
| **Descrição** | Na página de cadastro em espanhol, o link da política de privacidade aparece em português, no meio da frase em espanhol |
| **Ambiente** | Página localizada em espanhol (`/es/registrarse`) |
| **Localização** | Checkbox de aceite dos termos do formulário de cadastro |
| **Comportamento Atual** | Texto exibido: "Acepto la **política de privacidade** y los términos de uso." |
| **Comportamento Esperado** | "Acepto la **política de privacidad** y los términos de uso." |
| **Severidade** | Baixa |
| **Impacto** | Experiência do usuário - Inconsistência de idioma em um texto legal (aceite da política) |
| **Status** | Identificado pelo teste de idiomas em 26/09/2026 |
| **Evidência** | `Relatorio_QA_Blocks/evidencias/idiomas/idioma-es-politica.png` |

> **Observação (sem evidência capturada, não classificada como bug):** na página em espanhol, as opções "Other" e "ChatGPT / Gemini / Other AI" do campo "¿Cómo te enteraste de Blocks?" aparecem em inglês.

---

## 7. Análise Crítica de Qualidade

### Pontos Positivos:

- Fluxo de cadastro funciona corretamente do ponto de vista funcional
- Validações de campos estão implementadas
- Feedback visual adequado (botão desabilitado, mensagens de erro)
- Redirecionamento após cadastro bem-sucedido funciona conforme esperado

### Pontos de Atenção:

- **Exposição de dados pessoais pela API de verificação de email, sem autenticação (Bug #05, severidade alta, com implicações na LGPD)**
- Inconsistências de internacionalização nas mensagens de validação, títulos, botões e link da política, nas páginas em português e espanhol (confirmadas pelo teste automatizado de idiomas)
- Textos de login na tela de cadastro nos três idiomas ("Entrar", "Iniciar", "Sign in" e o título "Iniciar Sesión")
- Impacto na percepção de qualidade do produto
- Possível confusão para usuários não familiarizados com inglês

### Observações Técnicas:

Os testes automatizados foram implementados de forma a validar o comportamento atual da aplicação, evitando falhas artificiais causadas por textos fixos. Isso garante que os testes reflitam a realidade do sistema e não quebrem desnecessariamente.

---

## 8. Recomendações

### Prioridade Imediata (Bug #05):

- **Restringir a resposta da API de verificação de email** a um indicador de disponibilidade (ex: `{ "available": false }`), sem dados do titular
- **Aplicar limite de requisições** (rate limiting) na rota para dificultar a enumeração de contas
- **Envolver o encarregado de dados (DPO)** para avaliar o impacto e as obrigações previstas na LGPD

### Curto Prazo:

1. **Padronizar mensagens de validação** conforme o idioma selecionado na página
2. **Revisar todas as mensagens do formulário** para garantir consistência de idioma
3. **Implementar testes de regressão** para validações de idioma (ponto de partida já disponível neste projeto: `npm run test:idiomas`)

### Médio Prazo:

4. **Incluir critérios de aceite relacionados a idioma** nos requisitos de funcionalidade
5. **Criar checklist de internacionalização** para novas features
6. **Documentar padrões de mensagens** por idioma suportado

### Longo Prazo:

7. **Implementar testes de internacionalização automatizados** no pipeline CI/CD
8. **Criar biblioteca centralizada de mensagens** por idioma
9. **Realizar auditoria completa de internacionalização** em toda a aplicação

---

## 9. Considerações Finais

O fluxo principal de cadastro encontra-se funcional e estável, atendendo aos requisitos funcionais esperados. Todos os cenários de teste foram executados com sucesso, demonstrando a robustez do sistema.

Os bugs #01 a #04 e #06 são de severidade baixa e não impedem o uso da funcionalidade, mas impactam a experiência do usuário. O Bug #05 é de severidade alta: não afeta o funcionamento do cadastro, mas expõe dados pessoais dos usuários sem autenticação, em desacordo com os princípios de necessidade, segurança e prevenção e com o Art. 46 da LGPD, e deve ser priorizado.

Os testes automatizados implementados cumprem o objetivo proposto no desafio e evidenciam boas práticas de automação e análise de qualidade, incluindo:

- Padrão AAA (Arrange, Act, Assert)
- Data-Driven Testing
- Geração dinâmica de dados
- Evidências visuais (screenshots)
- Relatórios detalhados

De forma geral, a aplicação demonstra estabilidade funcional no fluxo de cadastro, com oportunidades de melhoria em aspectos de experiência de usuário e internacionalização, que poderia elevar ainda mais a percepção de qualidade do produto, e um ponto prioritário de segurança e privacidade de dados (Bug #05) a ser tratado com base na LGPD.

---

## Apêndice - Evidências Visuais (Screenshots)

### CT-01 - Cadastro com sucesso

![Cadastro com sucesso](evidencias/cypress/cadastroCompleto.cy.js/aposCadastro.png)

**Descrição:** Prova visual do redirecionamento para página de login após cadastro bem-sucedido

### CT-02 - Cadastro com email inválido

![Cadastro com email inválido](evidencias/cypress/cadastroEmailInv.cy.js/cadastroInvalido.png)

**Descrição:** Prova visual do alerta de email inválido

### CT-03 - Cadastro com email já em uso

![Cadastro com email já em uso](evidencias/cypress/cadastroEmailInv.cy.js/aposEmailjaUsado.png)

**Descrição:** Prova visual do alerta de email já em uso

### CT-04 - Cadastro sem aceitar política de privacidade

![Cadastro sem aceitar política de privacidade](evidencias/cypress/cadastroSemTermo.cy.js/cadastroSemTermo.png)

**Descrição:** Prova visual da tentativa de cadastro sem aceitar a política de privacidade

### CT-05 - Cadastro com senhas diferentes

![Cadastro com senhas diferentes](evidencias/cypress/cadastroSenhaDif.cy.js/cadastroSenhaDif.png)

**Descrição:** Prova visual da tentativa de cadastro com senhas diferentes

### Testes de Idioma - Título, Botão e Link da Política

![Página de cadastro em português (/pt)](evidencias/idiomas/idioma-pt-titulo-e-botao.png)

**Descrição (`/pt`):** título "Sign Up" em inglês (Bug #03) e botão "Entrar" (Bug #04)

![Página de cadastro em espanhol (/es)](evidencias/idiomas/idioma-es-titulo-e-botao.png)

**Descrição (`/es`):** título "Iniciar Sesión" e botão "Iniciar", textos de login (Bug #04); link "política de privacidade" em português (Bug #06)

![Página de cadastro em inglês (/en)](evidencias/idiomas/idioma-en-titulo-e-botao.png)

**Descrição (`/en`, controle):** título "Sign Up" correto; botão "Sign in", texto de login (Bug #04)

--- 

**Relatório gerado por:** Cristhian Cintra Barbosa  
**Ferramenta de automação:** Cypress v15.9.0  
**Data:** 22/01/2026 (atualizado em 26/09/2026)

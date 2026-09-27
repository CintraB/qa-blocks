//Aceita o banner de cookies da Blocks. O texto do botão fica centralizado aqui
//porque já mudou uma vez ("Permitir todos" -> "Aceitar todos").
Cypress.Commands.add('aceitarCookies', () => {
    cy.contains('button', 'Aceitar todos').click()
})

//Abre a página de cadastro (baseUrl no cypress.config.js) já com os cookies aceitos
Cypress.Commands.add('abrirCadastro', () => {
    cy.visit('/pt/registrar')
    cy.aceitarCookies()
})

//Digita o email e espera a verificação de disponibilidade que a página faz na API
//(GET /v1/user/email/<email>), em vez de esperar um tempo fixo
Cypress.Commands.add('digitarEmail', (email) => {
    cy.intercept('GET', '**/v1/user/email/*').as('verificarEmail')
    cy.get('#email').should('be.visible').type(email)
    cy.wait('@verificarEmail')
})

//Textos dos campos de seleção na página em português (/pt), usados por padrão
const TEXTOS_FORMULARIO_PT = {
    pais: 'Escolha o país',
    idiomaFamilia: 'Idioma da Família',
    comoSoube: 'Como você ficou sabendo sobre a Blocks?',
}

//Preenche todos os campos do formulário, exceto o aceite da política de privacidade
//usuario: um perfil do fixture userData.json | email: gerado no teste para ser único
//textos: rótulos dos campos de seleção no idioma da página (padrão: português)
//Campo do usuario (ou email) vazio/ausente não é preenchido: usado no teste de campos obrigatórios
Cypress.Commands.add('preencherCadastro', (usuario, email, textos = TEXTOS_FORMULARIO_PT) => {
    if (usuario.nome) cy.get('#first_name').should('be.visible').type(usuario.nome)
    if (usuario.sobrenome) cy.get('#last_name').should('be.visible').type(usuario.sobrenome)
    if (email) cy.digitarEmail(email)

    if (usuario.pais) {
        cy.get(`input[placeholder="${textos.pais}"]`).should('be.visible').type(usuario.pais)
        cy.contains('button', usuario.pais).click()
    }

    if (usuario.idiomaFamilia) {
        cy.contains('span', textos.idiomaFamilia).click()
        cy.contains('button', usuario.idiomaFamilia).click()
    }

    if (usuario.areaAtuacao) cy.contains('span', usuario.areaAtuacao).siblings('div').find('button').click() //logica para marcar o checkbox

    if (usuario.comoSoube) {
        cy.get('button').contains('span', textos.comoSoube).click()
        cy.contains('button', usuario.comoSoube).click()
    }

    if (usuario.senha) cy.get('#password').type(usuario.senha)
    if (usuario.confirmarSenha) cy.get('#confirm_password').type(usuario.confirmarSenha)
})

//Marca o checkbox de aceite da política de privacidade e termos de uso
Cypress.Commands.add('aceitarPolitica', () => {
    cy.contains('a', 'política de privacidade').parent().siblings('div').find('button').click()
})

//Cadastra um usuário completo pela interface e confirma o redirecionamento para o login.
//Usado quando o teste precisa de uma conta existente (ex: email já em uso)
Cypress.Commands.add('cadastrarUsuario', (usuario, email) => {
    cy.abrirCadastro()
    cy.preencherCadastro(usuario, email)
    cy.aceitarPolitica()
    cy.get('button[type="submit"]').click()
    cy.location('pathname').should('eq', '/pt/login')
})

//Emula um dispositivo como o modo de dispositivo do DevTools do Chrome, pelo protocolo do Chrome (CDP):
//tamanho da tela (cy.viewport, aplicado ao quadro da página testada), toque (pointer: coarse,
//ontouchstart) e user agent do aparelho. A densidade de tela (devicePixelRatio) não chega à página,
//que roda dentro do quadro do Cypress; ela não altera o layout.
//dispositivo: { largura, altura, toque, userAgent, plataforma }
const cdp = (command, params) => Cypress.automation('remote:debugger:protocol', { command, params })
//user agent original, lido antes de qualquer emulação, para ser restaurado depois
const USER_AGENT_ORIGINAL = window.navigator.userAgent

Cypress.Commands.add('emularDispositivo', (dispositivo) => {
    cy.viewport(dispositivo.largura, dispositivo.altura)
    if (dispositivo.toque) {
        cy.wrap(cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }), { log: false })
        cy.wrap(cdp('Emulation.setEmitTouchEventsForMouse', { enabled: true, configuration: 'mobile' }), { log: false })
    }
    if (dispositivo.userAgent) {
        cy.wrap(cdp('Network.setUserAgentOverride', { userAgent: dispositivo.userAgent, platform: dispositivo.plataforma || '' }), { log: false })
    }
})

//Desliga a emulação: as configurações do protocolo valem para a aba e passariam para o próximo teste
Cypress.Commands.add('desfazerEmulacao', () => {
    cy.wrap(cdp('Emulation.setTouchEmulationEnabled', { enabled: false }), { log: false })
    cy.wrap(cdp('Emulation.setEmitTouchEventsForMouse', { enabled: false }), { log: false })
    cy.wrap(cdp('Network.setUserAgentOverride', { userAgent: USER_AGENT_ORIGINAL }), { log: false })
})

//Faz login pela tela /pt/login (a página já deve estar aberta)
Cypress.Commands.add('fazerLogin', (email, senha) => {
    cy.get('#email').should('be.visible').type(email)
    cy.get('#password').type(senha, { log: false })
    //sem fixar o texto do botão ("Log in" em inglês é o Bug #03 e deve mudar)
    cy.get('button[type="submit"]').should('be.enabled').click()
})

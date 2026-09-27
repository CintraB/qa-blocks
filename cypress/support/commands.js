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
Cypress.Commands.add('preencherCadastro', (usuario, email, textos = TEXTOS_FORMULARIO_PT) => {
    cy.get('#first_name').should('be.visible').type(usuario.nome)
    cy.get('#last_name').should('be.visible').type(usuario.sobrenome)
    cy.digitarEmail(email)

    cy.get(`input[placeholder="${textos.pais}"]`).should('be.visible').type(usuario.pais)
    cy.contains('button', usuario.pais).click()

    cy.contains('span', textos.idiomaFamilia).click()
    cy.contains('button', usuario.idiomaFamilia).click()

    cy.contains('span', usuario.areaAtuacao).siblings('div').find('button').click() //logica para marcar o checkbox

    cy.get('button').contains('span', textos.comoSoube).click()
    cy.contains('button', usuario.comoSoube).click()

    cy.get('#password').type(usuario.senha)
    cy.get('#confirm_password').type(usuario.confirmarSenha)
})

//Marca o checkbox de aceite da política de privacidade e termos de uso
Cypress.Commands.add('aceitarPolitica', () => {
    cy.contains('a', 'política de privacidade').parent().siblings('div').find('button').click()
})

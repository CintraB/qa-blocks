describe("Cadastro com email invalido", () => {
    let userData
    before(() => {
        cy.fixture("userData").then((data) => {
            userData = data
        })
    })

    it("Realizar cadastro com email invalido", () => {
        //Metodo AAA (Arrange, Act, Assert)

        //Arrange
        cy.abrirCadastro()

        //Act
        cy.get('#first_name').type(userData.invalidUser.nome)
        cy.get('#last_name').type(userData.invalidUser.sobrenome)
        cy.get('#email').type(userData.invalidUser.email)

        cy.screenshot('cadastroInvalido')
        //Assert
        //BUG: Mensagem de validação em inglês quando a página está em português (/pt/registrar)
        //Exibido: "This is not a valid email." | Esperado: "Este não é um email válido." ou similar em português
        //Testando página em diferentes idiomas (pt, en, es) apresenta mensagem em inglês. Todo conteudo da página se mantem no idioma selecionado exceto a mensagem de validação.
        //O texto não é validado para o teste não quebrar quando a tradução for corrigida (Bug #01 no relatório).
        cy.get('#email').parent().find('span.text-red-600').should('be.visible').and('not.be.empty')
        cy.get('button[type="submit"]').should('be.disabled')
        cy.screenshot('aposcadastroInvalido')

    })

    it("Realizar cadastro com email ja em uso", () => {
        //Metodo AAA (Arrange, Act, Assert)

        //Arrange
        //cadastra um usuário para garantir que o email já existe, sem depender de dados pré-existentes
        const timestamp = Date.now()
        const emailEmUso = `emailemuso${timestamp}@gmail.com`

        cy.abrirCadastro()
        cy.preencherCadastro(userData.validUser, emailEmUso)
        cy.aceitarPolitica()
        cy.get('button[type="submit"]').click()
        cy.location('pathname').should('eq', '/pt/login')

        //limpa a sessão para voltar ao cadastro como um visitante novo (inclusive o banner de cookies)
        cy.clearAllCookies()
        cy.clearAllLocalStorage()
        cy.clearAllSessionStorage()
        cy.abrirCadastro()

        //Act
        cy.get('#first_name').type(userData.invalidUser.nome)
        cy.get('#last_name').type(userData.invalidUser.sobrenome)
        cy.digitarEmail(emailEmUso)

        cy.screenshot('emailjaUsado')
        //Assert
        cy.get('#email').parent().find('span.text-red-600').should('be.visible').and('contain', 'Este email já está em uso.')
        cy.get('button[type="submit"]').should('be.disabled')
        cy.screenshot('aposEmailjaUsado')
    })

})

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
        cy.visit("https://www.blocksrvt.com/pt/registrar")
        cy.contains("button", "Permitir todos").click()

        //Act
        cy.get('#first_name').type(userData.invalidUser.nome)
        cy.get('#last_name').type(userData.invalidUser.sobrenome)
        cy.get('#email').type(userData.invalidUser.email)

        cy.screenshot('cadastroInvalido')
        //Assert
        //BUG: Mensagem de validação em inglês quando a página está em português (/pt/registrar)
        //Esperado: "Este não é um email válido." ou similar em português
        //Testando página em diferentes idiomas (pt, en, es) apresenta mensagem em inglês. Todo conteudo da página se mantem no idioma selecionado exceto a mensagem de validação.
        cy.get('#email').parent().find('span.text-red-600').should('be.visible').and('contain', 'This is not a valid email.') //procurar por email ja em uso teste@gmail.com
        cy.get('button[type="submit"]').should('be.disabled')
        cy.screenshot('aposcadastroInvalido')
        //fazer um teste completo para passar um cadastro invalido

    })

    it("Realizar cadastro com email ja em uso", () => {
        //Metodo AAA (Arrange, Act, Assert)

        //Arrange
        cy.visit("https://www.blocksrvt.com/pt/registrar")
        cy.contains("button", "Permitir todos").click()

        //Act
        cy.get('#first_name').type(userData.invalidUser.nome)
        cy.get('#last_name').type(userData.invalidUser.sobrenome)
        cy.get('#email').type('teste@gmail.com')

        cy.screenshot('emailjaUsado')
        //Assert
        cy.get('#email').parent().find('span.text-red-600').should('be.visible').and('contain', 'Este email já está em uso.')
        cy.get('button[type="submit"]').should('be.disabled')
        cy.screenshot('aposEmailjaUsado')
    })

})
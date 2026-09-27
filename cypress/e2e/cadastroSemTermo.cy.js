describe("Cadastro sem confirmar a politica de privacidade", () => {
    let userData
    before(() => {
        cy.fixture("userData").then((data) => {
            userData = data
        })
    })

    it("Realizar cadastro sem confirmar a politica de privacidade", () => {
        //Metodo AAA (Arrange, Act, Assert)
        //Arrange
        const timestamp = Date.now()
        const emailUnico = `semtermo${timestamp}@gmail.com`

        cy.abrirCadastro()

        //Act
        //todos os campos preenchidos, sem aceitar a politica de privacidade
        cy.preencherCadastro(userData.userDenyPolicy, emailUnico)

        cy.screenshot('cadastroSemTermo')
        //Assert
        cy.get('button[type="submit"]').should('be.disabled')
        cy.location('pathname').should('eq', '/pt/registrar')
        cy.screenshot('aposCadastroSemTermo')
    })

})

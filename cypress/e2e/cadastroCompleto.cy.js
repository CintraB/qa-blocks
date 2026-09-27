describe("Cadastro completo", () => {
    let userData
    before(() => {
        cy.fixture("userData").then((data) => {
            userData = data
        })
    })

    it("Cadastrar um usuário com sucesso", () => {
        //Metodo AAA (Arrange, Act, Assert)
        //Arrange
        const timestamp = Date.now()
        const emailUnico = `teste${timestamp}@gmail.com`

        cy.abrirCadastro()

        //Act
        cy.preencherCadastro(userData.validUser, emailUnico)
        cy.aceitarPolitica()

        cy.screenshot('cadastroCompleto')

        cy.get('button[type="submit"]').click()

        //Assert
        //url mudou para efetuar login
        cy.location('pathname').should('eq', '/pt/login')
        //espera a tela de login renderizar antes da evidência
        cy.contains('a', 'Esqueci minha senha').should('be.visible')
        cy.screenshot('aposCadastro')
    })
})

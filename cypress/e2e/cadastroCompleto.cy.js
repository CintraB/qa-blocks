describe("Cadastro completo", () => {
    let userData
    before(() => {
        cy.fixture("userData").then((data) => {
            userData = data
        })
    })

    it("Cadastrar um usuário com sucesso e fazer login com a conta criada", () => {
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

        //Act + Assert: login com a conta recém-criada prova que o cadastro foi gravado de verdade
        cy.fazerLogin(emailUnico, userData.validUser.senha)
        cy.location('pathname', { timeout: 15000 }).should('eq', '/pt/home')
        cy.getCookie('is_logged').should('exist')
        //o aviso "Login efetuado com sucesso!" não é validado: no primeiro login ele pode não aparecer
        //a tempo e vem acompanhado de "Algo deu errado" (Bug #07 no relatório)
        cy.screenshot('aposLogin', { capture: 'viewport' })
    })
})

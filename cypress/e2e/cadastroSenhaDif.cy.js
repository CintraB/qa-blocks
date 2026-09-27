describe("Cadastro com senhas diferentes", () => {
    let userData
    before(() => {
        cy.fixture("userData").then((data) => {
            userData = data
        })
    })

    it("Realizar cadastro com senhas diferentes", () => {
        //Metodo AAA (Arrange, Act, Assert)
        //Arrange
        const timestamp = Date.now()
        const emailUnico = `senhasdif${timestamp}@gmail.com`

        cy.abrirCadastro()

        //Act
        cy.preencherCadastro(userData.differentPasswords, emailUnico)
        cy.aceitarPolitica()

        cy.screenshot('cadastroSenhaDif')
        //Assert
        //O texto da mensagem não é validado: hoje ele aparece em inglês ("Passwords must match"),
        //o que está registrado como Bug #02 no relatório. Validar o texto faria o teste quebrar
        //quando a tradução for corrigida.
        cy.get('#confirm_password').parent().parent().find('span.text-red-600').should('be.visible').and('not.be.empty')
        cy.get('button[type="submit"]').should('be.disabled')
        cy.screenshot('aposCadastroSenhaDif')
    })

})

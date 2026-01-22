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
        
        cy.visit("https://www.blocksrvt.com/pt/registrar")
        cy.contains("button", "Permitir todos").click()

        //Act
        cy.get('#first_name').should('be.visible').type(userData.validUser.nome)
        cy.get('#last_name').should('be.visible').type(userData.validUser.sobrenome)
        cy.get('#email').should('be.visible').type(emailUnico)
        cy.wait(500)

        cy.get('input[placeholder="Escolha o país"]').should('be.visible').type(userData.validUser.pais)
        cy.contains('button',userData.validUser.pais).click()

        cy.contains('span','Idioma da Família').click()
        cy.contains('button',userData.validUser.idiomaFamilia).click()

        cy.contains('span',userData.validUser.areaAtuacao).siblings('div').find('button').click() //logica para marcar o checkbox 

        cy.get('button').contains('span', 'Como você ficou sabendo sobre a Blocks?').click()
        cy.contains('button',userData.validUser.comoSoube).click()

        cy.get('#password').type(userData.validUser.senha)
        cy.get('#confirm_password').type(userData.validUser.confirmarSenha)

        cy.contains('a', 'política de privacidade').parent().siblings('div').find('button').click()

        cy.screenshot('cadastroCompleto')

        cy.get('button[type="submit"]').click()
        
        //Assert
        //url mudou para efetuar login
        cy.url().should('eq','https://www.blocksrvt.com/pt/login')
        cy.wait(1000)
        cy.screenshot('aposCadastro')
    })
})
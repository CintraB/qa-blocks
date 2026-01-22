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
        
        cy.visit("https://www.blocksrvt.com/pt/registrar")
        cy.contains("button", "Permitir todos").click()

        //Act
        cy.get('#first_name').type(userData.userDenyPolicy.nome)
        cy.get('#last_name').type(userData.userDenyPolicy.sobrenome)
        cy.get('#email').type(emailUnico)

        cy.get('input[placeholder="Escolha o país"]').type(userData.userDenyPolicy.pais)
        cy.contains('button',userData.userDenyPolicy.pais).click()

        cy.contains('span','Idioma da Família').click()
        cy.contains('button',userData.userDenyPolicy.idiomaFamilia).click()

        cy.contains('span',userData.userDenyPolicy.areaAtuacao).siblings('div').find('button').click() //logica para marcar o checkbox 

        cy.get('button').contains('span', 'Como você ficou sabendo sobre a Blocks?').click()
        cy.contains('button',userData.userDenyPolicy.comoSoube).click()

        cy.get('#password').type(userData.userDenyPolicy.senha)
        cy.get('#confirm_password').type(userData.userDenyPolicy.confirmarSenha)

        //desmarcado box de aceitar politica de privacidade
        //cy.contains('a', 'política de privacidade').parent().siblings('div').find('button').click()
        cy.screenshot('cadastroSemTermo')
        //Assert
        cy.get('button[type="submit"]').should('be.disabled')
        cy.url().should('eq','https://www.blocksrvt.com/pt/registrar')
        cy.screenshot('aposCadastroSemTermo')
    })
    
})
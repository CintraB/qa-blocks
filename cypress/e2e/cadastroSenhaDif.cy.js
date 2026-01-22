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
        
        cy.visit("https://www.blocksrvt.com/pt/registrar")
        cy.contains("button", "Permitir todos").click()

        //Act
        cy.get('#first_name').type(userData.differentPasswords.nome)
        cy.get('#last_name').type(userData.differentPasswords.sobrenome)
        cy.get('#email').type(emailUnico)

        cy.get('input[placeholder="Escolha o país"]').type(userData.differentPasswords.pais)
        cy.contains('button',userData.differentPasswords.pais).click()

        cy.contains('span','Idioma da Família').click()
        cy.contains('button',userData.differentPasswords.idiomaFamilia).click()

        cy.contains('span',userData.differentPasswords.areaAtuacao).siblings('div').find('button').click() //logica para marcar o checkbox 

        cy.get('button').contains('span', 'Como você ficou sabendo sobre a Blocks?').click()
        cy.contains('button',userData.differentPasswords.comoSoube).click()

        cy.get('#password').type(userData.differentPasswords.senha)
        cy.get('#confirm_password').type(userData.differentPasswords.confirmarSenha)

        cy.contains('a', 'política de privacidade').parent().siblings('div').find('button').click()

        cy.screenshot('cadastroSenhaDif')
        //cy.get('button[type="submit"]').click()
        //Assert
        cy.get('#confirm_password').parent().parent().find('span.text-red-600').should('be.visible').and('contain', 'Passwords must match') 
        cy.get('button[type="submit"]').should('be.disabled');
        cy.screenshot('aposCadastroSenhaDif')
    })


})
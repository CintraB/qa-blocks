//CT-12: feedback do formulário de cadastro - mostrar/ocultar senha e momento da validação.
//Nenhum cadastro é enviado. O envio com duplo clique fica na suíte de bugs conhecidos (Bug #09).

//botão do olho, ao lado do campo de senha (botão de ícone, sem texto)
const olhoDoCampo = (campo) => cy.get(campo).parent().find('button')

describe('Feedback do formulário de cadastro', () => {
    beforeEach(() => {
        //Arrange
        cy.abrirCadastro()
    })

    it('o olho mostra e oculta a senha somente do próprio campo', () => {
        //Arrange
        const senha = '826RcyZER*1'
        cy.get('#password').type(senha)
        cy.get('#confirm_password').type(senha)

        ;[['#password', '#confirm_password'], ['#confirm_password', '#password']].forEach(([campo, outro]) => {
            //Act: mostrar
            olhoDoCampo(campo).click()

            //Assert: a senha aparece, com o mesmo valor, e o ícone muda; o outro campo continua oculto
            cy.get(campo).should('have.attr', 'type', 'text').and('have.value', senha)
            olhoDoCampo(campo).find('svg').should('have.class', 'lucide-eye')
            cy.get(outro).should('have.attr', 'type', 'password')
            cy.screenshot(`olho-mostrando${campo.replace('#', '-')}`)

            //Act + Assert: ocultar de novo
            olhoDoCampo(campo).click()
            cy.get(campo).should('have.attr', 'type', 'password').and('have.value', senha)
            olhoDoCampo(campo).find('svg').should('have.class', 'lucide-eye-off')
        })
    })

    it('o erro do email aparece para email inválido e some quando o email é corrigido', () => {
        const erroDoEmail = () => cy.get('#email').parent().find('span.text-red-600')

        //Act: primeira tecla do email (o usuário ainda está digitando)
        cy.get('#email').type('m')

        //Assert: o erro já aparece com o campo em foco (observação de UX no relatório)
        cy.get('#email').should('have.focus')
        erroDoEmail().should('be.visible').and('not.be.empty')
        cy.screenshot('erro-email-na-primeira-tecla')

        //Act: termina de digitar um email válido
        cy.digitarEmail(`aria${Date.now()}@gmail.com`)

        //Assert: o erro some
        erroDoEmail().should('not.exist')
    })

    it('campo obrigatório deixado em branco não exibe mensagem ao sair dele', () => {
        //Act: entra e sai dos campos de texto sem preencher
        ;['#first_name', '#last_name', '#email'].forEach((campo) => {
            cy.get(campo).focus().blur()
        })

        //Assert: nenhum aviso; só o botão de cadastro desabilitado (observação de UX no relatório)
        cy.get('span.text-red-600').should('not.exist')
        cy.get('button[type="submit"]').should('be.disabled')
        cy.screenshot('obrigatorios-em-branco-sem-mensagem')
    })
})

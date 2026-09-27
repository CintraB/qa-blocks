//Acessibilidade: uso do formulário de cadastro somente pelo teclado (WCAG 2.2 - 2.1.1 Teclado
//e 2.4.7 Foco Visível). As teclas Tab, Enter e Espaço são enviadas pelo protocolo do Chrome
//(cypress-real-events), como um teclado de verdade.
//Observação: o texto do campo de país é digitado com cy.type, porque o realType não consegue
//digitar nesse campo (comportamento da ferramenta, conferido com digitação real no Chrome).

const descricaoDoFoco = () => cy.focused().then(($e) => $e.attr('id') || $e.attr('placeholder') || $e.text().trim())

describe('Acessibilidade - uso do cadastro pelo teclado', () => {
    beforeEach(() => {
        //Arrange
        cy.abrirCadastro()
    })

    it('a ordem do Tab segue a ordem visual dos campos', () => {
        //Act + Assert: do Nome até o País, um Tab por campo
        cy.get('#first_name').focus()
        const ORDEM = ['last_name', 'email', 'Escolha o país']
        ORDEM.forEach((esperado) => {
            cy.realPress('Tab')
            descricaoDoFoco().should('eq', esperado)
        })
    })

    it('o campo com foco pelo teclado tem indicador visível', () => {
        //Act: chega aos campos pelo Tab (o indicador de foco do teclado é o :focus-visible)
        cy.get('#first_name').focus()
        ;['#last_name', '#email'].forEach((campo) => {
            cy.realPress('Tab')

            //Assert: contorno de foco presente
            cy.get(campo).should('have.focus').and(($e) => {
                expect(getComputedStyle($e[0]).outlineStyle, `contorno de foco em ${campo}`).not.to.eq('none')
            })
        })
    })

    it('seleciona o país pelo teclado (digitar, Enter e Tab)', () => {
        //Act
        cy.get('input[placeholder="Escolha o país"]').type('Brazil')
        cy.contains('button', 'Brazil').should('be.visible')
        cy.realPress('Enter')
        cy.realPress('Tab')

        //Assert: o país continua no campo depois de sair dele (texto só digitado seria descartado)
        cy.get('input[placeholder="Escolha o país"]').should('have.value', 'Brazil')
    })

    it('seleciona o idioma da família pelo teclado (Enter abre, Tab chega à opção, Enter escolhe)', () => {
        //Act
        cy.contains('span', 'Idioma da Família').parents('button').first().focus()
        cy.realPress('Enter')
        cy.realPress('Tab')
        cy.focused().should('contain.text', 'Families in English')
        cy.realPress('Enter')

        //Assert: o campo passa a mostrar a opção escolhida
        cy.contains('button', 'Families in English').should('be.visible')
        cy.contains('span', 'Idioma da Família').should('not.exist')
    })

    it('marca área de atuação e aceite da política com a tecla Espaço', () => {
        //Act + Assert: cada caixa passa a exibir o ícone de marcada
        cy.contains('span', 'Estudante').siblings('div').find('button').focus()
        cy.realPress('Space')
        cy.contains('span', 'Estudante').siblings('div').find('button svg').should('exist')

        cy.contains('a', 'política de privacidade').parent().siblings('div').find('button').focus()
        cy.realPress('Space')
        cy.contains('a', 'política de privacidade').parent().siblings('div').find('button svg').should('exist')
        cy.screenshot('teclado-areas-e-politica', { capture: 'viewport' })
    })
})

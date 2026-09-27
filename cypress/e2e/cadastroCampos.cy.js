//Variações dos campos do cadastro (nome, país, área de atuação e email), validadas na tela.
//Nenhum cadastro é enviado, então nenhuma conta é criada.
//
//Aceito: com o formulário completo, o botão de cadastro habilita.
//Recusado (assert em duas etapas, para não passar por engano): o botão fica desabilitado
//e habilita depois que o valor é trocado por um válido.

describe('Variações dos campos do cadastro', () => {
    let userData
    before(() => {
        cy.fixture('userData').then((data) => {
            userData = data
        })
    })

    const emailUnico = (prefixo) => `${prefixo}${Date.now()}@gmail.com`
    const botaoCadastro = () => cy.get('button[type="submit"]')

    //preenche o formulário inteiro com as variações informadas e aceita a política
    const preencherCom = (variacoes, email) => {
        cy.abrirCadastro()
        cy.preencherCadastro({ ...userData.validUser, ...variacoes }, email)
        cy.aceitarPolitica()
    }

    describe('Nome e sobrenome', () => {
        const NOMES_ACEITOS = [
            { caso: 'com 1 caractere', nome: 'A', sobrenome: 'B' },
            { caso: 'com apóstrofo, hífen e acento', nome: 'Ana-Luíza', sobrenome: "D'Ávila Conceição" },
            { caso: 'com 300 caracteres (não há limite no formulário)', nome: 'N'.repeat(300), sobrenome: 'S'.repeat(300) },
        ]

        NOMES_ACEITOS.forEach(({ caso, nome, sobrenome }) => {
            it(`aceita nome ${caso}`, () => {
                //Act
                preencherCom({ nome, sobrenome }, emailUnico('nome'))

                //Assert
                botaoCadastro().should('be.enabled')
            })
        })

        it('recusa nome só com espaços', () => {
            //Act
            preencherCom({ nome: '   ' }, emailUnico('espacos'))

            //Assert 1: botão desabilitado (hoje sem mensagem explicando o motivo)
            botaoCadastro().should('be.disabled')
            cy.screenshot('nome-so-espacos', { capture: 'viewport' })

            //Assert 2: com um nome válido, o botão habilita
            cy.get('#first_name').clear().type(userData.validUser.nome)
            botaoCadastro().should('be.enabled')
        })
    })

    describe('País e área de atuação', () => {
        it('recusa país digitado sem escolher da lista', () => {
            //Act: digita o país, mas sai do campo sem clicar na opção
            const { pais, ...semPais } = userData.validUser
            cy.abrirCadastro()
            cy.preencherCadastro(semPais, emailUnico('pais'))
            cy.get('input[placeholder="Escolha o país"]').type(pais)
            cy.get('#first_name').click()
            cy.aceitarPolitica()

            //Assert 1: o texto digitado é descartado e o botão fica desabilitado
            cy.get('input[placeholder="Escolha o país"]').should('have.value', '')
            botaoCadastro().should('be.disabled')

            //Assert 2: escolhendo o país na lista, o botão habilita
            cy.preencherCadastro({ pais }, null)
            botaoCadastro().should('be.enabled')
        })

        it('aceita mais de uma área de atuação marcada', () => {
            //Act: o perfil já marca "Estudante"; marca também "Arquiteto"
            preencherCom({}, emailUnico('areas'))
            cy.contains('span', 'Arquiteto').siblings('div').find('button').click()

            //Assert: as duas ficam marcadas (ícone de check) e o botão continua habilitado
            ;['Estudante', 'Arquiteto'].forEach((area) => {
                cy.contains('span', area).siblings('div').find('button svg').should('exist')
            })
            botaoCadastro().should('be.enabled')
            cy.screenshot('duas-areas-marcadas', { capture: 'viewport' })
        })
    })

    describe('Email', () => {
        const EMAILS_ACEITOS = [
            { caso: 'com +tag', email: () => `nome+tag${Date.now()}@gmail.com` },
            { caso: 'com subdomínio', email: () => `sub${Date.now()}@mail.empresa.com.br` },
            //254 caracteres: tamanho máximo de um endereço de email (RFC 5321)
            { caso: 'com 254 caracteres (tamanho máximo)', email: () => `${Date.now()}${'a'.repeat(51)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(57)}.com` },
        ]

        EMAILS_ACEITOS.forEach(({ caso, email }) => {
            it(`aceita email ${caso}`, () => {
                //Act
                preencherCom({}, email())

                //Assert
                cy.get('#email').parent().find('span.text-red-600').should('not.exist')
                botaoCadastro().should('be.enabled')
            })
        })

        it('recusa email com espaços antes e depois', () => {
            //Act: o email não passa pela verificação da API, então é digitado direto
            preencherCom({}, null)
            const email = emailUnico('espaco')
            cy.get('#email').type(`  ${email}  `)
            cy.get('#first_name').click()

            //Assert 1: mensagem de email inválido e botão desabilitado (os espaços não são removidos)
            cy.get('#email').parent().find('span.text-red-600').should('be.visible').and('not.be.empty')
            botaoCadastro().should('be.disabled')
            cy.screenshot('email-com-espacos', { capture: 'viewport' })

            //Assert 2: sem os espaços, o botão habilita
            cy.get('#email').clear()
            cy.digitarEmail(email)
            botaoCadastro().should('be.enabled')
        })
    })
})

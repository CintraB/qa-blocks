//Regras de senha do cadastro: análise de valor-limite e partição de equivalência.
//Regras observadas no formulário (27/09/2026): mínimo de 9 caracteres, com pelo menos
//uma letra maiúscula, uma minúscula, um número e um caractere especial.
//
//As mensagens hoje aparecem em inglês (mesma família do Bug #02). Para não quebrar quando
//forem traduzidas, cada regra é reconhecida por uma expressão que aceita inglês e português.

const SENHAS_INVALIDAS = [
    { caso: '8 caracteres (limite mínimo - 1)', senha: 'Ab1*Ab1*', regra: /\b9\b/, id: 'tamanho-8' },
    { caso: 'sem letra maiúscula', senha: 'abcdefg1*', regra: /uppercase|maiúscula/i, id: 'sem-maiuscula' },
    { caso: 'sem letra minúscula', senha: 'ABCDEFG1*', regra: /lowercase|minúscula/i, id: 'sem-minuscula' },
    { caso: 'sem número', senha: 'Abcdefgh*', regra: /number|número/i, id: 'sem-numero' },
    { caso: 'sem caractere especial', senha: 'Abcdefgh1', regra: /special|especial/i, id: 'sem-especial' },
]

const SENHAS_VALIDAS = [
    { caso: '9 caracteres (limite mínimo)', senha: 'Ab1*Ab1*a' },
    { caso: '10 caracteres (limite mínimo + 1)', senha: 'Ab1*Ab1*ab' },
    { caso: 'com espaço', senha: 'Senha 123*a' },
    { caso: '160 caracteres (sem limite máximo no formulário)', senha: 'Aa1*'.repeat(40) },
]

//a mensagem de erro fica dois níveis acima do campo de senha
const erroDaSenha = () => cy.get('#password').parent().parent().find('span.text-red-600')

const digitarSenha = (senha) => {
    cy.get('#password').clear().type(senha, { delay: 0 })
    cy.get('#first_name').click() //sai do campo para disparar a validação
}

describe('Regras de senha do cadastro', () => {
    beforeEach(() => {
        //Arrange
        cy.abrirCadastro()
    })

    SENHAS_INVALIDAS.forEach(({ caso, senha, regra, id }) => {
        it(`rejeita senha ${caso}`, () => {
            //Act
            digitarSenha(senha)

            //Assert: aparece a mensagem da regra violada
            erroDaSenha().should('be.visible').invoke('text').should('match', regra)
            cy.screenshot(`senha-${id}`)
        })
    })

    SENHAS_VALIDAS.forEach(({ caso, senha }) => {
        it(`aceita senha ${caso}`, () => {
            //Act
            //primeiro uma senha inválida, para garantir que a validação está ativa...
            digitarSenha('a')
            erroDaSenha().should('be.visible')

            //...depois a senha válida
            digitarSenha(senha)

            //Assert: a mensagem de erro some
            erroDaSenha().should('not.exist')
        })
    })
})

//No servidor: o cadastro usa o AWS Cognito, cujo limite de senha é 256 caracteres.
//Fica fora do describe acima porque cria a própria conta (cadastrarUsuario abre a página).
describe('Regras de senha no servidor', () => {
    it('cadastra com senha de 256 caracteres (limite do servidor), faz login e recusa a senha truncada em 72', () => {
        cy.fixture('userData').then((userData) => {
            //Arrange
            const senha256 = 'Aa1*'.repeat(64)
            const email = `senha256${Date.now()}@gmail.com`

            //Act: cadastro e login com a senha completa
            cy.cadastrarUsuario({ ...userData.validUser, senha: senha256, confirmarSenha: senha256 }, email)
            cy.fazerLogin(email, senha256)

            //Assert: login funciona com os 256 caracteres
            cy.location('pathname', { timeout: 15000 }).should('eq', '/pt/home')
            cy.getCookie('is_logged').should('exist')

            //Act: sai e tenta os 72 primeiros caracteres (sistemas com bcrypt ignoram o que passa de 72 bytes)
            //sai da página antes de limpar a sessão: com a home aberta, o site grava o cookie de novo
            cy.window().then((win) => { win.location.href = 'about:blank' })
            cy.clearAllCookies()
            cy.clearAllLocalStorage()
            cy.clearAllSessionStorage()
            cy.visit('/pt/login')
            cy.aceitarCookies()
            cy.fazerLogin(email, senha256.slice(0, 72))

            //Assert: login recusado, a senha é comparada por inteiro
            cy.contains('Algo deu errado', { timeout: 15000 }).should('be.visible')
            cy.location('pathname').should('eq', '/pt/login')
            cy.getCookie('is_logged').should('not.exist')
            cy.window().then((win) => {
                expect(Object.keys(win.localStorage).filter((k) => k.includes('idToken')), 'token do Cognito').to.be.empty
            })
            cy.screenshot('senha-256-truncada-72-recusada', { capture: 'runner' })
        })
    })
})

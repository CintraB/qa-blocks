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

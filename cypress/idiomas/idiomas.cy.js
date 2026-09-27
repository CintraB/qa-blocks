//Testes de internacionalização da página de cadastro (pt, es, en).
//
//Estes testes validam o comportamento ESPERADO: cada texto no idioma da página.
//Hoje vários deles FALHAM de propósito, porque os bugs #01 a #04 e #06 do relatório existem.
//Por isso ficam fora da suíte principal (npm test) e rodam com: npm run test:idiomas
//Quando a Blocks corrigir os textos, estes testes passam a ficar verdes.
//
//A página em inglês (/en) funciona como controle: o que é correto nela não pode ser
//o texto exibido nas páginas em português e espanhol.

const IDIOMAS = [
    {
        lang: 'pt',
        botaoCookies: 'Aceitar todos',
        //textos que não podem aparecer no título do cadastro (inglês ou texto de login)
        tituloProibido: ['Sign Up', 'Log in', 'Entrar'],
        //textos que não podem estar no botão de enviar o cadastro (ação de login)
        botaoEnviarProibido: ['Entrar', 'Log in', 'Sign in'],
        linkPolitica: /^política de privacidade$/,
        controle: false,
        //rótulos dos campos de seleção e opções escolhidas, no idioma da página
        textosFormulario: { pais: 'Escolha o país', idiomaFamilia: 'Idioma da Família', comoSoube: 'Como você ficou sabendo sobre a Blocks?' },
        usuario: { idiomaFamilia: 'Famílias em Português', areaAtuacao: 'Estudante' },
    },
    {
        lang: 'es',
        botaoCookies: 'Aceptar todas',
        tituloProibido: ['Sign Up', 'Iniciar Sesión'],
        botaoEnviarProibido: ['Iniciar', 'Iniciar Sesión', 'Sign in'],
        linkPolitica: /^política de privacidad$/,
        controle: false,
        textosFormulario: { pais: 'Elegir Pais', idiomaFamilia: 'Idioma de las Famílias', comoSoube: '¿Cómo te enteraste de Blocks?' },
        usuario: { idiomaFamilia: 'Familias en Español', areaAtuacao: 'Estudiante' },
    },
    {
        lang: 'en',
        botaoCookies: 'Accept all',
        tituloProibido: ['Sign in', 'Log in'],
        botaoEnviarProibido: ['Sign in', 'Log in'],
        linkPolitica: /^privacy policy$/,
        controle: true, //na página em inglês, as mensagens em inglês são o correto
        textosFormulario: { pais: 'Choose Country', idiomaFamilia: 'Family language', comoSoube: 'How did you hear about Blocks' },
        usuario: { idiomaFamilia: 'Families in English', areaAtuacao: 'Student' },
    },
]

//mensagens em inglês exibidas hoje (bugs #01 e #02)
const EMAIL_INVALIDO_EN = 'This is not a valid email.'
const SENHAS_DIFERENTES_EN = 'Passwords must match'

IDIOMAS.forEach((idioma) => {
    describe(`Idioma da página de cadastro - /${idioma.lang}`, () => {
        beforeEach(() => {
            //Arrange
            cy.visit(`/${idioma.lang}/registrar`)
            cy.contains('button', idioma.botaoCookies).click()
        })


        it('mensagem de email inválido no idioma da página (Bug #01)', () => {
            //Act
            cy.get('#email').type('email-invalido')

            //Assert
            //o print vem antes da verificação para existir evidência justamente quando o bug aparece
            cy.get('#email').parent().find('span.text-red-600').should('be.visible')
            cy.screenshot(`idioma-${idioma.lang}-email-invalido`)
            cy.get('#email').parent().find('span.text-red-600').invoke('text').then((texto) => {
                if (!idioma.controle) {
                    expect(texto.trim(), `mensagem na página /${idioma.lang}`).not.to.eq(EMAIL_INVALIDO_EN)
                } else {
                    expect(texto.trim(), 'controle /en').to.eq(EMAIL_INVALIDO_EN)
                }
            })
        })

        it('mensagem de senhas diferentes no idioma da página (Bug #02)', () => {
            //Act
            //a validação de senhas iguais só é exibida com todos os outros campos válidos
            cy.fixture('userData').then((userData) => {
                const usuario = { ...userData.differentPasswords, ...idioma.usuario }
                cy.preencherCadastro(usuario, `idioma${idioma.lang}${Date.now()}@gmail.com`, idioma.textosFormulario)
            })

            //Assert
            cy.get('#confirm_password').parent().parent().find('span.text-red-600').should('be.visible')
            cy.screenshot(`idioma-${idioma.lang}-senhas-diferentes`)
            cy.get('#confirm_password').parent().parent().find('span.text-red-600').invoke('text').then((texto) => {
                if (!idioma.controle) {
                    expect(texto.trim(), `mensagem na página /${idioma.lang}`).not.to.eq(SENHAS_DIFERENTES_EN)
                } else {
                    expect(texto.trim(), 'controle /en').to.eq(SENHAS_DIFERENTES_EN)
                }
            })
        })

        it('título do formulário no idioma da página e sem texto de login (Bugs #03 e #04)', () => {
            //Assert
            //o título é o primeiro texto do cartão do formulário, acima de "Por favor preencha seus dados"
            cy.screenshot(`idioma-${idioma.lang}-titulo-e-botao`)
            cy.get('form').parent().find('span').first().invoke('text').then((titulo) => {
                expect(idioma.tituloProibido, `título "${titulo.trim()}" na página /${idioma.lang}`).not.to.include(titulo.trim())
            })
        })

        it('botão de enviar o cadastro sem texto de login (Bug #04)', () => {
            //Assert
            //evidência: o mesmo print do teste do título (idioma-<lang>-titulo-e-botao)
            cy.get('button[type="submit"]').invoke('text').then((rotulo) => {
                expect(idioma.botaoEnviarProibido, `botão "${rotulo.trim()}" na página /${idioma.lang}`).not.to.include(rotulo.trim())
            })
        })

        it('link da política de privacidade no idioma da página (Bug #06)', () => {
            //Assert
            cy.screenshot(`idioma-${idioma.lang}-politica`)
            cy.get('button[type="submit"]').parents('form').find('a').filter((_, a) => /polít|privac/i.test(a.innerText))
                .first().invoke('text').then((link) => {
                    expect(link.trim(), `link na página /${idioma.lang}`).to.match(idioma.linkPolitica)
                })
        })
    })
})

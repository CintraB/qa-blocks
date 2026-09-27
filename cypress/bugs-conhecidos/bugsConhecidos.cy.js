//Testes de regressão de bugs conhecidos (Bugs #07 e #08 do relatório).
//
//Estes testes validam o comportamento ESPERADO e hoje FALHAM de propósito, porque os bugs
//existem. Por isso ficam fora da suíte principal (npm test) e rodam com: npm run test:bugs
//Quando a Blocks corrigir, passam a ficar verdes e servem de regressão.
//Em cada teste, o print é tirado antes da verificação, para registrar o bug quando aparece.

describe('Bugs conhecidos', () => {
    let userData
    before(() => {
        cy.fixture('userData').then((data) => {
            userData = data
        })
    })

    it('Bug #07 - primeiro login após o cadastro não exibe aviso de erro', () => {
        //Arrange
        const email = `bug07${Date.now()}@gmail.com`
        cy.cadastrarUsuario(userData.validUser, email)

        //Act
        cy.fazerLogin(email, userData.validUser.senha)
        cy.location('pathname', { timeout: 15000 }).should('eq', '/pt/home')

        //Assert: observa os avisos por 8 segundos após o login (o aviso de erro aparece ~3 s depois).
        //Esperar uma janela fixa aqui é intencional: o teste verifica a AUSÊNCIA de um aviso,
        //que não tem um evento para aguardar.
        const avisos = new Set()
        Cypress._.times(16, () => {
            cy.wait(500, { log: false })
            cy.document({ log: false }).then((doc) => {
                doc.querySelectorAll('[data-sonner-toast], [role=status], [role=alert]').forEach((e) => {
                    const texto = e.innerText.trim().replace(/\s+/g, ' ')
                    if (texto) avisos.add(texto)
                    if (/Algo deu errado/.test(texto) && !avisos.has('print')) {
                        avisos.add('print')
                        cy.screenshot('bug07-aviso-de-erro-no-primeiro-login', { capture: 'runner' })
                    }
                })
            })
        })
        cy.then(() => {
            const textos = [...avisos].filter((a) => a !== 'print')
            expect(textos, 'avisos exibidos após o primeiro login').not.to.include('Algo deu errado. Por favor, tente novamente.')
        })
    })

    it('Bug #08 - senha acima do limite do servidor exibe erro e não finge sucesso', () => {
        //Arrange: 257 caracteres, 1 acima do limite de 256 do AWS Cognito usado pelo cadastro
        const senha257 = 'Aa1*'.repeat(64) + 'b'
        const email = `bug08${Date.now()}@gmail.com`
        cy.intercept('POST', '**/v1/user').as('criarUsuario')

        //Act
        cy.abrirCadastro()
        cy.preencherCadastro({ ...userData.validUser, senha: senha257, confirmarSenha: senha257 }, email)
        cy.aceitarPolitica()
        cy.get('button[type="submit"]').click()

        //Assert
        //o print mostra no log do Cypress a resposta da API e a página para onde o usuário foi levado
        cy.wait('@criarUsuario', { timeout: 20000 }).then(({ request, response }) => {
            cy.wait(3000, { log: false })
            //painel com a resposta real da API, desenhado pelo teste por cima da página, para o
            //print mostrar juntos a página para onde o usuário foi levado e o que o servidor respondeu
            cy.document().then((doc) => {
                const painel = doc.createElement('div')
                painel.style.cssText = 'position:fixed;left:12px;right:12px;top:12px;z-index:99999;background:#1f2937;color:#fff;font:12px/1.45 Consolas,monospace;padding:10px 12px;border-radius:6px;white-space:pre-wrap;word-break:break-all'
                painel.textContent = `[painel adicionado pelo teste]\n${request.method} ${request.url} -> HTTP ${response.statusCode}\n${JSON.stringify(response.body)}`
                doc.body.appendChild(painel)
            })
            cy.screenshot('bug08-senha-257-cadastro', { capture: 'runner' })
            //se o servidor recusa a senha, o usuário precisa ser avisado e continuar no cadastro
            if (response.statusCode >= 400) {
                cy.location('pathname', { timeout: 1000 }).should('eq', '/pt/registrar')
            } else {
                cy.request(`https://api.blocksrvt.com/v1/user/email/${email}`).its('status').should('eq', 200)
            }
        })
    })
})

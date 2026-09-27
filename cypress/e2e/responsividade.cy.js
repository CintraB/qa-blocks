//Responsividade da página de cadastro (WCAG 2.2 - 1.4.10 Realinhar, nível AA).
//Aparelhos: emulados como no modo de dispositivo do DevTools do Chrome (cy.emularDispositivo):
//tamanho da tela, toque e user agent do aparelho, pelo protocolo do Chrome.
//Desktop: 320 px de largura equivale a 1280 px com zoom de 400% (nota do critério 1.4.10) e
//640 px equivale a 1280 px com zoom de 200%.
//Limitação: é emulação no motor do Chrome; não substitui o teste em aparelho real (Safari no iOS).

const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const ANDROID = 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'

const DISPOSITIVOS = [
    { nome: 'iPhone SE', largura: 375, altura: 667, toque: true, userAgent: IOS, plataforma: 'iPhone' },
    { nome: 'iPhone 14', largura: 390, altura: 844, toque: true, userAgent: IOS, plataforma: 'iPhone' },
    { nome: 'Galaxy S20', largura: 360, altura: 800, toque: true, userAgent: ANDROID, plataforma: 'Android' },
    { nome: 'iPad', largura: 820, altura: 1180, toque: true, userAgent: IPAD, plataforma: 'iPad' },
    { nome: 'Desktop com zoom de 400% (320 px)', largura: 320, altura: 568 },
    { nome: 'Desktop com zoom de 200% (640 px)', largura: 640, altura: 400 },
    { nome: 'Desktop 1280 px', largura: 1280, altura: 800 },
    { nome: 'Desktop 1920 px', largura: 1920, altura: 1080 },
]

const arquivo = (nome) => 'resp-' + nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')

describe('Responsividade da página de cadastro', () => {
    afterEach(() => {
        cy.desfazerEmulacao()
    })

    DISPOSITIVOS.forEach((d) => {
        it(`${d.nome} (${d.largura}x${d.altura}): sem rolagem horizontal e formulário utilizável`, () => {
            //Arrange
            cy.emularDispositivo(d)
            cy.abrirCadastro()

            //Assert: nos aparelhos, a página recebe a emulação (toque e ponteiro de celular)
            if (d.toque) {
                cy.window().should((win) => {
                    expect(win.matchMedia('(pointer: coarse)').matches, 'ponteiro de toque').to.eq(true)
                    expect(win.navigator.userAgent, 'user agent do aparelho').to.eq(d.userAgent)
                })
            }

            //Assert: sem rolagem horizontal e nenhum elemento do formulário vazando pelas bordas
            cy.document().should((doc) => {
                const win = doc.defaultView
                expect(doc.documentElement.scrollWidth, 'largura do conteúdo').to.be.at.most(win.innerWidth)
                const vazando = [...doc.querySelectorAll('form, form *')].filter((e) => {
                    const b = e.getBoundingClientRect()
                    return b.width > 0 && (b.right > win.innerWidth + 1 || b.left < -1)
                })
                expect(vazando.length, 'elementos do formulário fora da tela').to.eq(0)
            })

            //Act + Assert: nos aparelhos, um toque marca a caixa de seleção
            if (d.toque) {
                cy.contains('span', 'Estudante').siblings('div').find('button').realTouch()
                cy.contains('span', 'Estudante').siblings('div').find('button svg').should('exist')
            }

            //Evidência do topo da página, na altura real do aparelho
            cy.scrollTo('top', { ensureScrollable: false })
            cy.screenshot(`${arquivo(d.nome)}-1-topo`, { capture: 'viewport' })

            //Assert: o botão de cadastro pode ser alcançado rolando a página
            cy.get('button[type="submit"]').scrollIntoView({ offset: { top: -200, left: 0 } }).should('be.visible')
            cy.screenshot(`${arquivo(d.nome)}-2-rodape`, { capture: 'viewport' })
        })
    })
})

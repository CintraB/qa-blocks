//Acessibilidade - bugs conhecidos (Bugs #09 a #12 do relatório).
//Validam o comportamento ESPERADO pela WCAG 2.2 (nível A e AA) e hoje FALHAM de propósito.
//Rodam fora da suíte principal: npm run test:bugs
//Em cada teste a evidência é gerada antes da verificação: os elementos com problema recebem
//um contorno vermelho e um painel "[painel adicionado pelo teste]" descreve o que foi encontrado.

const WCAG_A_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

//contorna os elementos e desenha o painel de evidência por cima da página
const marcarEvidencia = (doc, elementos, linhasDoPainel) => {
    elementos.forEach((el) => {
        el.style.outline = '3px solid #dc2626'
        el.style.outlineOffset = '2px'
    })
    const painel = doc.createElement('div')
    painel.style.cssText = 'position:fixed;left:12px;right:12px;top:12px;z-index:99999;background:#1f2937;color:#fff;font:12px/1.45 Consolas,monospace;padding:10px 12px;border-radius:6px;white-space:pre-wrap'
    painel.textContent = ['[painel adicionado pelo teste - contorno vermelho nos elementos citados]', ...linhasDoPainel].join('\n')
    doc.body.appendChild(painel)
}

//nome acessível simplificado: aria-labelledby, aria-label, label associado, texto e placeholder
const nomeAcessivel = (el) => {
    const doc = el.ownerDocument
    const por = el.getAttribute('aria-labelledby')
    if (por) return por.split(/\s+/).map((id) => doc.getElementById(id)?.innerText.trim() || '').join(' ')
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label')
    if (el.id && doc.querySelector(`label[for="${el.id}"]`)) return doc.querySelector(`label[for="${el.id}"]`).innerText.trim()
    const texto = (el.innerText || '').trim()
    if (texto) return texto
    return el.getAttribute('placeholder') || ''
}

describe('Bugs conhecidos - acessibilidade', () => {
    beforeEach(() => {
        cy.abrirCadastro()
    })

    it('Bugs #09, #11 e #12 - página de cadastro sem violações críticas ou sérias da WCAG (axe-core)', () => {
        cy.injectAxe()
        cy.window().then((win) => win.axe.run(win.document, { runOnly: { type: 'tag', values: WCAG_A_AA } })).then((resultado) => {
            const graves = resultado.violations.filter((v) => ['critical', 'serious'].includes(v.impact))
            cy.document().then((doc) => {
                const elementos = graves.flatMap((v) => v.nodes.map((n) => doc.querySelector(n.target.join(' ')))).filter(Boolean)
                const criterio = (v) => v.tags.filter((t) => /^wcag\d{3,}$/.test(t)).map((t) => t.replace('wcag', '').split('').join('.')).join(', ')
                marcarEvidencia(doc, elementos, [
                    `axe-core ${resultado.testEngine.version} | regras WCAG 2.0, 2.1 e 2.2 (A/AA) | ${graves.length} violações críticas/sérias`,
                    ...graves.map((v) => `- ${v.id} (${v.impact}, WCAG ${criterio(v)}): ${v.help} - ${v.nodes.length} elemento(s)`),
                ])
            })
            cy.screenshot('a11y-axe-violacoes', { capture: 'runner' })
            cy.then(() => {
                expect(graves.map((v) => `${v.id} (${v.nodes.length})`), 'violações críticas/sérias da WCAG').to.be.empty
            })
        })
    })

    it('Bug #09 - caixas de seleção informam papel, nome e estado (WCAG 4.1.2)', () => {
        //as 6 áreas de atuação e o aceite da política
        cy.contains('span', 'Estudante').siblings('div').find('button').click()
        cy.document().then((doc) => {
            const areas = ['Arquiteto', 'Designer de Interiores', 'Eng. Civil', 'Estudante', 'Educação', 'Outro']
            const caixas = areas.map((a) => ({ rotulo: a, el: [...doc.querySelectorAll('span')].find((s) => s.innerText.trim() === a).parentElement.querySelector('button') }))
            const link = [...doc.querySelectorAll('a')].find((a) => /política de privacidade/.test(a.innerText))
            caixas.push({ rotulo: 'Aceite da política', el: link.parentElement.parentElement.querySelector('button') })
            const leitura = caixas.map(({ rotulo, el }) => ({
                rotulo,
                el,
                papel: el.getAttribute('role') || el.tagName.toLowerCase(),
                estado: el.getAttribute('aria-checked') ?? '(não informado)',
                nome: nomeAcessivel(el) || '(vazio)',
            }))
            marcarEvidencia(doc, leitura.map((l) => l.el), [
                'O que a tecnologia assistiva recebe de cada caixa de seleção ("Estudante" está marcada na tela):',
                ...leitura.map((l) => `- ${l.rotulo}: papel=${l.papel} | nome=${l.nome} | marcado=${l.estado}`),
            ])
            cy.screenshot('a11y-caixas-de-selecao', { capture: 'runner' })
            cy.then(() => {
                leitura.forEach((l) => {
                    expect(l.papel, `papel de "${l.rotulo}"`).to.eq('checkbox')
                    expect(l.estado, `estado de "${l.rotulo}"`).to.be.oneOf(['true', 'false'])
                    expect(l.nome, `nome de "${l.rotulo}"`).not.to.eq('(vazio)')
                })
            })
        })
    })

    it('Bug #13 - campos com dados do usuário identificam o propósito com autocomplete (WCAG 1.3.5)', () => {
        //valores esperados: seção 7 "Finalidades de Entrada" da WCAG 2.2
        const CAMPOS = [
            { seletor: '#first_name', rotulo: 'Nome', esperado: 'given-name' },
            { seletor: '#last_name', rotulo: 'Sobrenome', esperado: 'family-name' },
            { seletor: '#email', rotulo: 'Email', esperado: 'email' },
            { seletor: 'input[placeholder="Escolha o país"]', rotulo: 'País', esperado: 'country-name' },
            { seletor: '#password', rotulo: 'Senha', esperado: 'new-password' },
            { seletor: '#confirm_password', rotulo: 'Confirme sua Senha', esperado: 'new-password' },
        ]
        cy.document().then((doc) => {
            const leitura = CAMPOS.map((c) => {
                const el = doc.querySelector(c.seletor)
                return { ...c, el, atual: el.getAttribute('autocomplete') || '(ausente)', tipo: el.type }
            })
            marcarEvidencia(doc, leitura.map((l) => l.el), [
                'Atributo autocomplete dos campos (esperado conforme a seção 7 da WCAG 2.2):',
                ...leitura.map((l) => `- ${l.rotulo}: autocomplete=${l.atual} | esperado=${l.esperado} | type=${l.tipo}`),
            ])
            cy.screenshot('a11y-autocomplete', { capture: 'runner' })
            cy.then(() => {
                leitura.forEach((l) => {
                    expect(l.atual, `autocomplete de "${l.rotulo}"`).to.eq(l.esperado)
                })
            })
        })
    })

    it('Bug #10 - campos de senha têm nome acessível que descreve a finalidade (WCAG 2.4.6 e 4.1.2)', () => {
        //os campos ficam no fim do formulário: centraliza para aparecerem inteiros no print
        cy.get('#confirm_password').scrollIntoView({ offset: { top: -330, left: 0 } })
        cy.document().then((doc) => {
            const campos = ['password', 'confirm_password'].map((id) => doc.getElementById(id))
            const leitura = campos.map((el) => ({ el, id: el.id, nome: nomeAcessivel(el) }))
            marcarEvidencia(doc, campos, [
                'Nome acessível dos campos de senha (o que o leitor de tela anuncia):',
                ...leitura.map((l) => `- #${l.id}: "${l.nome}"`),
                'Os rótulos visíveis "Senha" e "Confirme sua Senha" não estão associados aos campos.',
            ])
            cy.screenshot('a11y-campos-de-senha', { capture: 'runner' })
            cy.then(() => {
                leitura.forEach((l) => {
                    expect(l.nome, `nome acessível de #${l.id}`).to.match(/senha/i)
                })
            })
        })
    })
})

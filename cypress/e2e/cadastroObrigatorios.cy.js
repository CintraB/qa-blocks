//Campos obrigatórios do cadastro: cada campo é deixado em branco, um de cada vez, com todos
//os outros preenchidos.
//Assert em duas etapas, para o teste não passar por engano:
//1) com o campo faltando, o botão de cadastro fica desabilitado;
//2) ao preencher só esse campo, o botão habilita, provando que ele era o único motivo do bloqueio.
//Nenhum cadastro é enviado, então nenhuma conta é criada.

const CAMPOS = [
    { campo: 'nome', descricao: 'Nome' },
    { campo: 'sobrenome', descricao: 'Sobrenome' },
    { campo: 'email', descricao: 'Email' },
    { campo: 'pais', descricao: 'País' },
    { campo: 'idiomaFamilia', descricao: 'Idioma da Família' },
    { campo: 'areaAtuacao', descricao: 'Área de atuação' },
    { campo: 'comoSoube', descricao: 'Como ficou sabendo da Blocks' },
    { campo: 'senha', descricao: 'Senha' },
    { campo: 'confirmarSenha', descricao: 'Confirmação de senha' },
    { campo: 'politica', descricao: 'Aceite da política de privacidade' },
]

describe('Campos obrigatórios do cadastro', () => {
    let userData
    before(() => {
        cy.fixture('userData').then((data) => {
            userData = data
        })
    })

    CAMPOS.forEach(({ campo, descricao }) => {
        it(`não permite cadastrar sem: ${descricao}`, () => {
            //Arrange
            const email = `obrigatorio${Date.now()}@gmail.com`
            const usuario = { ...userData.validUser }
            if (campo !== 'email' && campo !== 'politica') delete usuario[campo]

            cy.abrirCadastro()

            //Act: preenche tudo, menos o campo da vez
            cy.preencherCadastro(usuario, campo === 'email' ? null : email)
            if (campo !== 'politica') cy.aceitarPolitica()

            //Assert 1: sem o campo, o botão de cadastro fica desabilitado
            cy.get('button[type="submit"]').should('be.disabled')
            cy.screenshot(`obrigatorio-sem-${campo}`)

            //Act: preenche somente o campo que faltava
            if (campo === 'politica') cy.aceitarPolitica()
            else if (campo === 'email') cy.preencherCadastro({}, email)
            else cy.preencherCadastro({ [campo]: userData.validUser[campo] }, null)

            //Assert 2: o botão habilita, então esse campo era o único motivo do bloqueio
            cy.get('button[type="submit"]').should('be.enabled')
        })
    })
})

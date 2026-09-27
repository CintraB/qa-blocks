//Gera as evidências com fonte oficial em Relatorio_QA_Blocks/evidencias/ (Bug #05):
//prints dos artigos da LGPD (planalto.gov.br e gov.br) e da resposta da API de verificação de email.
//Cada print leva uma faixa com a URL de origem e a data/hora da captura.
//
//Também gera os prints das diretrizes de usabilidade da Nielsen Norman Group (Bug #09 e CT-12)
//e os do AWS Cognito (CT-09): o login da Blocks chamando o Cognito e o limite de senha na documentação da AWS.
//
//Uso: npm run evidencias -- <email de uma conta criada pela própria suíte de testes>
//     npm run evidencias -- --ux        (somente os prints da Nielsen Norman Group)
//     npm run evidencias -- --cognito   (somente os prints do AWS Cognito; login com a conta do CT-01)
//Nunca usar email de terceiros: a resposta da API traz dados pessoais do titular.
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, '..', 'Relatorio_QA_Blocks', 'evidencias');
fs.mkdirSync(path.join(OUT, 'ux'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'cognito'), { recursive: true });

const LEI = 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm';
const MDS = 'https://www.gov.br/mds/pt-br/acesso-a-informacao/governanca/integridade/campanhas/lgpd';
const NNG_ERROS = 'https://www.nngroup.com/articles/errors-forms-design-guidelines/';
const NNG_HEURISTICAS = 'https://www.nngroup.com/articles/ten-usability-heuristics/';
const AWS_ADMIN_CREATE_USER = 'https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminCreateUser.html';
const SO_UX = process.argv.includes('--ux');
const SO_COGNITO = process.argv.includes('--cognito');
const EMAIL_PROPRIO = process.argv.slice(2).find(a => !a.startsWith('--')) || 'teste1790470745345@gmail.com'; //conta criada pelo CT-01 em 26/09/2026
const API = `https://api.blocksrvt.com/v1/user/email/${EMAIL_PROPRIO}`;

const agora = () => new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + ' (horário de Brasília)';

//Insere a faixa de fonte antes do primeiro bloco, destaca os trechos citados e recorta do topo da faixa ao fim do último bloco
//semLinks: ignora trechos que são links (ex: o sumário da página, que repete os títulos)
async function capturar(page, { url, arquivo, blocos, destaques, nota, semLinks = false }) {
  const clip = await page.evaluate(({ url, blocos, destaques, nota, quando, semLinks }) => {
    const norm = s => s.replace(/\s+/g, ' ').trim();
    const raiz = document.querySelector('#content') || document;
    const els = [...raiz.querySelectorAll('p, li, h2, h3, h4, strong, dt')]
      .filter(e => !semLinks || !(e.closest('a') || e.querySelector('a')));
    const acha = re => els.find(e => new RegExp(re).test(norm(e.innerText)));
    const primeiro = acha(blocos[0]);
    const ultimo = acha(blocos[1]);
    if (!primeiro || !ultimo) return { erro: `trecho não encontrado: ${!primeiro ? blocos[0] : blocos[1]}` };

    destaques.forEach(re => {
      const e = acha(re);
      if (e) { e.style.background = '#fff176'; e.style.color = '#000'; e.style.outline = '2px solid #f9a825'; }
    });

    const faixa = document.createElement('div');
    faixa.style.cssText = 'font:13px/1.45 Segoe UI,Arial,sans-serif;background:#1f2937;color:#fff;padding:10px 14px;margin:8px 0;border-radius:6px;text-align:left;text-indent:0';
    faixa.innerHTML = `<b style="color:#fff">Fonte:</b> <span style="color:#93c5fd;word-break:break-all">${url}</span><br>` +
      `<b style="color:#fff">Capturado em:</b> ${quando}<br><span style="color:#d1d5db">${nota}</span>`;
    const alvo = primeiro.closest('li') || primeiro;
    alvo.parentNode.insertBefore(faixa, alvo);

    //leva o trecho para a área visível e recorta só o que está na tela: com a janela visível,
    //capturar fora da área visível (captureBeyondViewport) deslocava o recorte
    faixa.scrollIntoView({ block: 'start' });
    //elementos fixos (cabeçalho, widgets) ficariam por cima do trecho no print
    for (const el of document.querySelectorAll('body *')) {
      const pos = getComputedStyle(el).position;
      if (pos === 'fixed' || pos === 'sticky') el.style.visibility = 'hidden';
    }
    const a = faixa.getBoundingClientRect();
    const b = (ultimo.closest('li') || ultimo).getBoundingClientRect();
    const esq = Math.min(a.left, b.left) - 8;
    return {
      x: Math.max(0, esq + window.scrollX), y: a.top + window.scrollY - 8,
      width: Math.max(a.right, b.right) - esq + 16, height: b.bottom - a.top + 16,
    };
  }, { url, blocos, destaques, nota, quando: agora(), semLinks });
  if (clip.erro) throw new Error(`${arquivo}: ${clip.erro}`);
  await page.screenshot({ path: path.join(OUT, arquivo), clip, captureBeyondViewport: false });
  console.log('ok', arquivo);
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 800, deviceScaleFactor: 1.5 });
  const nota = 'Destaque em amarelo adicionado na captura para indicar o trecho citado no relatório.';

  if (SO_COGNITO) {
    //Documentação oficial da AWS: limite de 256 caracteres do parâmetro TemporaryPassword (o mesmo do erro do Bug #08).
    //Tema claro (a página segue o tema do sistema) e cabeçalho do site escondido (ficaria por cima da faixa)
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await page.goto(AWS_ADMIN_CREATE_USER, { waitUntil: 'networkidle2', timeout: 90000 });
    await page.addStyleTag({ content: '#awsdocs-header, #awsccc-cb-c { display: none !important }' });
    await capturar(page, {
      url: AWS_ADMIN_CREATE_USER, arquivo: 'cognito/aws-cognito-temporarypassword-256.png',
      blocos: ['^TemporaryPassword$', '^Length Constraints: Maximum length of 256\\.'],
      destaques: ['^TemporaryPassword$', '^Length Constraints: Maximum length of 256\\.'],
      nota,
    });

    //Login da Blocks com a conta criada pela suíte (CT-01): lista as chamadas ao Cognito e as chaves
    //de sessão gravadas no navegador. Valores de token não são exibidos.
    const senha = require('../cypress/fixtures/userData.json').validUser.senha;
    const chamadas = [];
    page.on('response', (res) => {
      const req = res.request();
      if (/cognito-idp\./.test(req.url()) && req.method() === 'POST') {
        chamadas.push(`${req.method()} ${req.url()}  X-Amz-Target: ${req.headers()['x-amz-target']}  -> HTTP ${res.status()}`);
      }
    });
    await page.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1.5 });
    await page.goto('https://www.blocksrvt.com/pt/login', { waitUntil: 'networkidle2', timeout: 90000 });
    await page.evaluate(() => [...document.querySelectorAll('button')].find(b => /Aceitar todos/.test(b.textContent))?.click());
    await page.type('#email', EMAIL_PROPRIO);
    await page.type('#password', senha);
    await page.click('button[type=submit]');
    await page.waitForFunction(() => location.pathname === '/pt/home', { timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    await page.evaluate(({ chamadas, quando }) => {
      //o identificador do app no Cognito (clientId) é trocado por <clientId>; os tokens não aparecem
      const chaves = Object.keys(localStorage).filter(k => k.startsWith('CognitoIdentityServiceProvider.'))
        .map(k => k.replace(/^CognitoIdentityServiceProvider\.[^.]+\./, 'CognitoIdentityServiceProvider.<clientId>.'));
      for (const el of document.querySelectorAll('body *')) {
        const pos = getComputedStyle(el).position;
        if (pos === 'fixed' || pos === 'sticky') el.style.visibility = 'hidden';
      }
      const painel = document.createElement('div');
      painel.style.cssText = 'position:fixed;visibility:visible;left:12px;right:12px;top:12px;z-index:99999;background:#1f2937;color:#fff;font:12px/1.5 Consolas,monospace;padding:12px 14px;border-radius:6px;white-space:pre-wrap;word-break:break-all';
      painel.textContent = [
        '[painel adicionado na captura]',
        `Página: ${location.href}  (login concluído)`,
        `Capturado em: ${quando}`,
        '',
        'Requisições do login ao servidor de autenticação:',
        ...chamadas,
        '',
        'Chaves de sessão gravadas no localStorage (valores omitidos):',
        ...chaves,
      ].join('\n');
      document.body.appendChild(painel);
    }, { chamadas, quando: agora() });
    await page.screenshot({ path: path.join(OUT, 'cognito/login-blocks-chama-cognito.png') });
    console.log('ok cognito/login-blocks-chama-cognito.png', chamadas.length, 'chamadas');
    await browser.close();
    return;
  }

  //Nielsen Norman Group: diretriz 7 de erros em formulários (CT-12) e heurísticas 1 e 5 (Bug #09)
  const capNng = async (url, arquivo, blocos, destaques) => {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
    await capturar(page, { url, arquivo, blocos, destaques, nota, semLinks: true });
  };
  await capNng(NNG_ERROS, 'ux/nng-nao-validar-antes-de-terminar.png',
    ['Validate Fields Before Input', 'frustrating to see an error'], ['Validate Fields Before Input', 'avoid showing an error until']);
  await capNng(NNG_HEURISTICAS, 'ux/nng-heuristica-1-visibilidade-do-status.png',
    ['Visibility of System Status$', 'always keep users informed'], ['always keep users informed']);
  await capNng(NNG_HEURISTICAS, 'ux/nng-heuristica-5-prevencao-de-erros.png',
    ['Error Prevention$', 'best designs carefully prevent'], ['best designs carefully prevent']);
  if (SO_UX) { await browser.close(); return; }

  //Lei 13.709/2018 (LGPD) - texto oficial no Planalto
  const capLei = async (arquivo, blocos, destaques) => {
    await page.goto(LEI, { waitUntil: 'networkidle2', timeout: 90000 });
    await capturar(page, { url: LEI, arquivo, blocos, destaques, nota });
  };
  await capLei('lgpd-art5-dado-pessoal.png', ['^Art\\. 5º Para os fins', '^I - dado pessoal'], ['^I - dado pessoal']);
  await capLei('lgpd-art6-principios.png', ['^Art\\. 6º As atividades', '^VIII - prevenção'],
    ['^Art\\. 6º As atividades', '^III - necessidade', '^VII - segurança', '^VIII - prevenção']);
  await capLei('lgpd-art46-seguranca.png', ['^Art\\. 46\\. Os agentes', '^Art\\. 46\\. Os agentes'], ['^Art\\. 46\\. Os agentes']);

  //Página LGPD do gov.br (MDS): janela alta para não precisar rolar, cookies recusados e
  //cabeçalho escondido (#site-header.sticky-header é reposicionado por script e cobriria o trecho)
  await page.setViewport({ width: 1000, height: 4000, deviceScaleFactor: 1.5 });
  await page.goto(MDS, { waitUntil: 'networkidle2', timeout: 90000 });
  await page.evaluate(() => {
    const rejeitar = [...document.querySelectorAll('button')].find(b => /Rejeitar cookies/i.test(b.innerText));
    if (rejeitar) rejeitar.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.addStyleTag({ content: '#site-header{visibility:hidden !important}' });
  await capturar(page, {
    url: MDS, arquivo: 'govbr-lgpd-principios-e-dado-pessoal.png',
    blocos: ['^As atividades de tratamento de dados pessoais deverão', '^O dado pessoal é aquele'],
    destaques: ['^Necessidade;$', '^Segurança;$', '^Prevenção;$', '^O dado pessoal é aquele'],
    nota,
  });

  //Resposta real da API para a conta criada pela suíte: valores pessoais mascarados antes do print
  await page.goto(API, { waitUntil: 'networkidle2', timeout: 90000 });
  const status = await page.evaluate(() => performance.getEntriesByType('navigation')[0].responseStatus);
  await page.evaluate(({ API, status, quando }) => {
    const dados = JSON.parse(document.body.innerText);
    const MASCARAR = ['id', 'ip.ip', 'ip.company.name', 'ip.location.city', 'ip.location.postal',
      'ip.location.region.code', 'ip.location.region.name', 'ip.location.latitude', 'ip.location.longitude',
      'ip.connection.asn', 'ip.connection.route', 'ip.connection.domain', 'ip.connection.organization', 'code'];
    const RECOLHER = ['ip.currency', 'ip.location.country', 'ip.location.language', 'ip.location.continent',
      'ip.security', 'ip.time_zone'];
    const trata = (o, p = '') => {
      for (const k of Object.keys(o)) {
        const q = p ? `${p}.${k}` : k;
        if (MASCARAR.includes(q) && o[k] !== null) o[k] = '[MASCARADO]';
        else if (RECOLHER.includes(q) && o[k]) o[k] = `{ …${Object.keys(o[k]).length} campos recolhidos na captura }`;
        else if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) trata(o[k], q);
      }
    };
    trata(dados);
    const json = JSON.stringify(dados, null, 2)
      .replace(/"(ip|city|postal|latitude|longitude|region|connection|organization|company)":/g, '<span style="background:#fff176;color:#000">"$1"</span>:');
    document.body.style.cssText = 'background:#fff;color:#111;margin:0';
    document.body.innerHTML =
      `<div style="font:13px/1.45 Segoe UI,Arial,sans-serif;background:#1f2937;color:#fff;padding:10px 14px;margin:8px;border-radius:6px">` +
      `<b style="color:#fff">Fonte:</b> <span style="color:#93c5fd;word-break:break-all">GET ${API}</span> → <b>HTTP ${status}</b>, sem autenticação<br>` +
      `<b style="color:#fff">Capturado em:</b> ${quando}<br>` +
      `<span style="color:#d1d5db">Conta criada pela própria suíte de testes (CT-01). Resposta real, formatada na captura: ` +
      `valores pessoais mascarados, grupos não pessoais recolhidos e nomes de campos pessoais destacados em amarelo.</span></div>` +
      `<pre style="font:12px/1.4 Consolas,monospace;margin:8px 16px;white-space:pre-wrap">${json}</pre>`;
  }, { API, status, quando: agora() });
  await page.setViewport({ width: 760, height: 800, deviceScaleFactor: 1.5 });
  await page.screenshot({ path: path.join(OUT, 'bug05-api-resposta-mascarada.png'), fullPage: true });
  console.log('ok bug05-api-resposta-mascarada.png', status);

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

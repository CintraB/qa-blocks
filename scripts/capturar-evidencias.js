//Gera as evidências com fonte oficial em Relatorio_QA_Blocks/evidencias/ (Bug #05 e acessibilidade):
//prints dos artigos da LGPD e da LBI (planalto.gov.br e gov.br) e da resposta da API de verificação de email.
//Cada print leva uma faixa com a URL de origem e a data/hora da captura.
//
//Uso: npm run evidencias -- <email de uma conta criada pela própria suíte de testes>
//Nunca usar email de terceiros: a resposta da API traz dados pessoais do titular.
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, '..', 'Relatorio_QA_Blocks', 'evidencias');
fs.mkdirSync(OUT, { recursive: true });

const LEI = 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm';
const MDS = 'https://www.gov.br/mds/pt-br/acesso-a-informacao/governanca/integridade/campanhas/lgpd';
const LBI = 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm';
const EMAIL_PROPRIO = process.argv[2] || 'teste1790470745345@gmail.com'; //conta criada pelo CT-01 em 26/09/2026
const API = `https://api.blocksrvt.com/v1/user/email/${EMAIL_PROPRIO}`;

const agora = () => new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + ' (horário de Brasília)';

//Insere a faixa de fonte antes do primeiro bloco, destaca os trechos citados e recorta do topo da faixa ao fim do último bloco
async function capturar(page, { url, arquivo, blocos, destaques, nota }) {
  const clip = await page.evaluate(({ url, blocos, destaques, nota, quando }) => {
    const norm = s => s.replace(/\s+/g, ' ').trim();
    const raiz = document.querySelector('#content') || document;
    const els = [...raiz.querySelectorAll('p, li, h2, h3, h4, strong')];
    const acha = re => els.find(e => new RegExp(re).test(norm(e.innerText)));
    const primeiro = acha(blocos[0]);
    const ultimo = acha(blocos[1]);
    if (!primeiro || !ultimo) return { erro: `trecho não encontrado: ${!primeiro ? blocos[0] : blocos[1]}` };

    destaques.forEach(re => {
      const e = acha(re);
      if (e) { e.style.background = '#fff176'; e.style.outline = '2px solid #f9a825'; }
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
  }, { url, blocos, destaques, nota, quando: agora() });
  if (clip.erro) throw new Error(`${arquivo}: ${clip.erro}`);
  await page.screenshot({ path: path.join(OUT, arquivo), clip, captureBeyondViewport: false });
  console.log('ok', arquivo);
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 800, deviceScaleFactor: 1.5 });
  const nota = 'Destaque em amarelo adicionado na captura para indicar o trecho citado no relatório.';

  //Lei 13.709/2018 (LGPD) - texto oficial no Planalto
  const capLei = async (arquivo, blocos, destaques) => {
    await page.goto(LEI, { waitUntil: 'networkidle2', timeout: 90000 });
    await capturar(page, { url: LEI, arquivo, blocos, destaques, nota });
  };
  await capLei('lgpd-art5-dado-pessoal.png', ['^Art\\. 5º Para os fins', '^I - dado pessoal'], ['^I - dado pessoal']);
  await capLei('lgpd-art6-principios.png', ['^Art\\. 6º As atividades', '^VIII - prevenção'],
    ['^Art\\. 6º As atividades', '^III - necessidade', '^VII - segurança', '^VIII - prevenção']);
  await capLei('lgpd-art46-seguranca.png', ['^Art\\. 46\\. Os agentes', '^Art\\. 46\\. Os agentes'], ['^Art\\. 46\\. Os agentes']);

  //Lei Brasileira de Inclusão (Lei 13.146/2015), Art. 63 - acessibilidade em sites de empresas
  await page.goto(LBI, { waitUntil: 'networkidle2', timeout: 90000 });
  await capturar(page, {
    url: LBI, arquivo: 'acessibilidade/lbi-art63-acessibilidade-sites.png',
    blocos: ['^Art\\. 63\\. É obrigatória', '^§ 1º Os sítios devem conter'],
    destaques: ['^Art\\. 63\\. É obrigatória'],
    nota,
  });

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

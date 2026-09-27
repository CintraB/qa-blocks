const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

function convertImageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.warn(`⚠️  Não foi possível carregar a imagem: ${imagePath}`);
    return '';
  }
}

const idDaEvidencia = (caminho) => 'ev-' + caminho.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
const semTags = (html) => html.replace(/<[^>]+>/g, '').trim();

//Liga as referências a prints às imagens dentro do PDF:
//- cada link para evidencias/*.png vira uma âncora interna para a imagem;
//- a primeira vez que a imagem aparece no relatório ganha a âncora de destino;
//- prints referenciados que não aparecem no relatório vão para um anexo gerado aqui;
//- embaixo de cada imagem referenciada entram links "Voltar para" o ponto de leitura.
function ligarEvidencias(html) {
  const referencias = {}; //id da evidência -> [{ ref, secao }]
  const embutidas = new Set();
  const caminhos = {};
  let secaoAtual = '';
  let n = 0;

  const padrao = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>|<a href="(evidencias\/[^"]+?\.png)">([\s\S]*?)<\/a>|<img src="(evidencias\/[^"]+?\.png)"([^>]*)>/g;
  html = html.replace(padrao, (trecho, _nivel, titulo, hrefRef, textoRef, srcImg, restoImg) => {
    if (titulo !== undefined) {
      secaoAtual = semTags(titulo);
      return trecho;
    }
    if (hrefRef) {
      const id = idDaEvidencia(hrefRef);
      caminhos[id] = hrefRef;
      const ref = `ref-${++n}`;
      (referencias[id] = referencias[id] || []).push({ ref, secao: secaoAtual });
      return `<a class="ref-evidencia" id="${ref}" href="#${id}">${textoRef}</a>`;
    }
    const id = idDaEvidencia(srcImg);
    caminhos[id] = srcImg;
    if (embutidas.has(id)) return trecho;
    embutidas.add(id);
    return `<figure class="evidencia" id="${id}"><img src="${srcImg}"${restoImg}><!--voltar:${id}--></figure>`;
  });

  //prints referenciados que não aparecem no relatório: anexo gerado
  const semImagem = Object.keys(referencias).filter((id) => !embutidas.has(id));
  if (semImagem.length) {
    html += '<h2 class="anexo">Anexo - Evidências Referenciadas</h2>';
    html += '<p>Prints citados ao longo do relatório. Cada um tem um link para voltar ao ponto de leitura.</p>';
    semImagem.forEach((id) => {
      html += `<figure class="evidencia" id="${id}"><figcaption class="caminho">${caminhos[id]}</figcaption><img src="${caminhos[id]}" alt="${caminhos[id]}"><!--voltar:${id}--></figure>`;
    });
  }

  //links de volta: um por seção de onde a imagem é citada
  html = html.replace(/<!--voltar:([^>]+?)-->/g, (_, id) => {
    const refs = referencias[id] || [];
    const porSecao = refs.filter((r, i) => refs.findIndex((x) => x.secao === r.secao) === i);
    if (!porSecao.length) return '';
    return '<p class="voltar">' + porSecao.map((r) => `<a href="#${r.ref}">Voltar para: ${r.secao}</a>`).join('<br>') + '</p>';
  });

  const totalRefs = Object.values(referencias).reduce((s, r) => s + r.length, 0);
  console.log(`🔗 ${totalRefs} referências ligadas a ${Object.keys(referencias).length} prints (${semImagem.length} no anexo gerado)`);
  return html;
}

//Troca o caminho de cada imagem pelo conteúdo em base64, para o PDF não depender dos arquivos
function embutirImagens(html, baseDir) {
  let total = 0;
  const resultado = html.replace(/<img src="([^"]+)"/g, (trecho, src) => {
    if (src.startsWith('data:') || /^https?:/.test(src)) return trecho;
    const absoluto = path.resolve(baseDir, src);
    if (!fs.existsSync(absoluto)) {
      console.warn(`   ⚠️  Arquivo não encontrado: ${absoluto}`);
      return trecho;
    }
    total++;
    return `<img src="${convertImageToBase64(absoluto)}"`;
  });
  console.log(`🖼️  ${total} imagens embutidas no PDF`);
  return resultado;
}

async function exportMarkdownToPDF() {
  const markdownPath = path.join(__dirname, 'Relatorio_QA_Blocks', 'Cristhian_Cintra_Barbosa_Relatorio_QA_Blocks.md');
  const outputPath = path.join(__dirname, 'Relatorio_QA_Blocks', 'Cristhian_Cintra_Barbosa_Relatorio_QA_Blocks.pdf');
  const baseDir = path.dirname(markdownPath);

  console.log('📄 Lendo arquivo Markdown...');
  let markdownContent = fs.readFileSync(markdownPath, 'utf-8');

  console.log('🔄 Convertendo Markdown para HTML...');
  let htmlContent = marked.parse(markdownContent);

  console.log('🔄 Ligando referências às evidências...');
  htmlContent = ligarEvidencias(htmlContent);

  console.log('🔄 Processando imagens...');
  htmlContent = embutirImagens(htmlContent, baseDir);

  const fullHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Testes - Blocks</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
      margin-top: 30px;
      margin-bottom: 20px;
      font-size: 28px;
    }
    
    h2 {
      color: #34495e;
      margin-top: 25px;
      margin-bottom: 15px;
      font-size: 22px;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 8px;
    }
    
    h3 {
      color: #555;
      margin-top: 20px;
      margin-bottom: 12px;
      font-size: 18px;
    }
    
    p {
      margin-bottom: 12px;
      text-align: justify;
    }
    
    ul, ol {
      margin-left: 25px;
      margin-bottom: 15px;
    }
    
    li {
      margin-bottom: 8px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    th {
      background-color: #3498db;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    
    td {
      padding: 10px 12px;
      border: 1px solid #ddd;
    }
    
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    
    tr:hover {
      background-color: #e8f4f8;
    }
    
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }
    
    pre {
      background-color: #2c3e50;
      color: #ecf0f1;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 15px 0;
    }
    
    pre code {
      background-color: transparent;
      color: #ecf0f1;
      padding: 0;
    }
    
    blockquote {
      border-left: 4px solid #3498db;
      padding-left: 15px;
      margin: 15px 0;
      color: #555;
      font-style: italic;
    }
    
    hr {
      border: none;
      border-top: 2px solid #ecf0f1;
      margin: 30px 0;
    }
    
    strong {
      color: #2c3e50;
      font-weight: 600;
    }
    
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20px auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 5px;
    }
    
    a.ref-evidencia {
      color: #2471a3;
      text-decoration: none;
      border-bottom: 1px dotted #2471a3;
    }

    figure.evidencia {
      margin: 20px 0;
      page-break-inside: avoid;
    }

    figure.evidencia figcaption.caminho {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #555;
      margin-bottom: 6px;
    }

    p.voltar {
      font-size: 13px;
      text-align: left;
      margin-top: -10px;
    }

    p.voltar a {
      color: #2471a3;
      text-decoration: none;
    }

    h2.anexo {
      page-break-before: always;
    }

    .page-break {
      page-break-after: always;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      h1 {
        page-break-after: avoid;
      }
      
      h2, h3 {
        page-break-after: avoid;
      }
      
      table {
        page-break-inside: avoid;
      }
      
      tr {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
  `;

  console.log('🚀 Iniciando Puppeteer...');
  
  const chromePath = puppeteer.executablePath();
  console.log(`📍 Chromium localizado em: ${chromePath}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: chromePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled'
    ],
    ignoreDefaultArgs: false,
    dumpio: true
  });

  try {
    console.log('📄 Criando página...');
    const page = await browser.newPage();
    
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0'
    });

    console.log('💾 Gerando PDF...');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      preferCSSPageSize: false
    });

    console.log('✅ PDF gerado com sucesso!');
    console.log(`📁 Arquivo salvo em: ${outputPath}`);
  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

exportMarkdownToPDF().catch(error => {
  console.error('❌ Falha na exportação:', error);
  process.exit(1);
});

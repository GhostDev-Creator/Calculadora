let chart = null;
let historico = JSON.parse(localStorage.getItem('historicoEquacoes')) || [];
let recognition = null;
let isListening = false;

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    document.querySelector('.theme-toggle').textContent = newTheme === 'light' ? '🌙' : '☀️';
}

function iniciarVoz() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        mostrarAlerta('Speech Recognition não é suportado neste navegador. Use Chrome ou Edge.', 'error');
        return;
    }

    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isListening = true;
        document.getElementById('voiceBtn').classList.add('listening');
        document.getElementById('voiceBtn').innerHTML = '<i class="ri-mic-fill"></i> Escutando...';
    };

    recognition.onresult = (event) => {
        const comando = event.results[0][0].transcript.toLowerCase();
        processarComandoVoz(comando);
    };

    recognition.onend = () => {
        isListening = false;
        document.getElementById('voiceBtn').classList.remove('listening');
        document.getElementById('voiceBtn').innerHTML = '<i class="ri-mic-fill"></i> Usar Voz';
    };

    recognition.onerror = (event) => {
        mostrarAlerta('Erro na captura de voz: ' + event.error, 'error');
        pararVoz();
    };

    recognition.start();
}

function pararVoz() {
    if (recognition) {
        recognition.stop();
    }
    isListening = false;
    document.getElementById('voiceBtn').classList.remove('listening');
    document.getElementById('voiceBtn').innerHTML = '<i class="ri-mic-fill"></i> Usar Voz';
}

function processarComandoVoz(comando) {
    const numeros = comando.match(/-?\d+(?:[.,]\d+)?/g) || [];
    const aMatch = comando.match(/a\s*(?:igual\s*)?(?:a\s*)?(-?\d+(?:[.,]\d+)?)/i);
    const bMatch = comando.match(/b\s*(?:igual\s*)?(?:a\s*)?(-?\d+(?:[.,]\d+)?)/i);
    const cMatch = comando.match(/c\s*(?:igual\s*)?(?:a\s*)?(-?\d+(?:[.,]\d+)?)/i);

    let a = parseFloat(document.getElementById('a').value) || 0;
    let b = parseFloat(document.getElementById('b').value) || 0;
    let c = parseFloat(document.getElementById('c').value) || 0;

    if (aMatch) a = parseFloat(aMatch[1].replace(',', '.'));
    if (bMatch) b = parseFloat(bMatch[1].replace(',', '.'));
    if (cMatch) c = parseFloat(cMatch[1].replace(',', '.'));

    if (numeros.length >= 3) {
        [a, b, c] = numeros.map(n => parseFloat(n.replace(',', '.'))).slice(0, 3);
    }

    document.getElementById('a').value = a || '';
    document.getElementById('b').value = b || '';
    document.getElementById('c').value = c || '';

    mostrarAlerta(`Reconhecido: a=${a}, b=${b}, c=${c}`, 'success');
    pararVoz();
}

function validarInputs(a, b, c) {
    if (!a || !b || !c) {
        mostrarAlerta('Preencha todos os campos!', 'error');
        return false;
    }
    if (a == 0) {
        mostrarAlerta('O coeficiente "a" não pode ser zero (não é equação quadrática)!', 'error');
        return false;
    }
    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        mostrarAlerta('Insira apenas números válidos!', 'error');
        return false;
    }
    return true;
}

function mostrarAlerta(mensagem, tipo) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo}`;
    alertDiv.textContent = mensagem;
    document.querySelector('.left-panel').appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function calcularDelta(a, b, c) {
    return b * b - 4 * a * c;
}

function calcularRaizes(a, b, c, delta) {
    if (delta > 0) {
        const x1 = (-b + Math.sqrt(delta)) / (2 * a);
        const x2 = (-b - Math.sqrt(delta)) / (2 * a);
        return { x1: parseFloat(x1.toFixed(6)), x2: parseFloat(x2.toFixed(6)), tipo: 'reais_distintas' };
    } else if (delta === 0) {
        const x0 = -b / (2 * a);
        return { x1: parseFloat(x0.toFixed(6)), x2: parseFloat(x0.toFixed(6)), tipo: 'real_dupla' };
    } else {
        const real = parseFloat((-b / (2 * a)).toFixed(6));
        const imag = parseFloat((Math.sqrt(-delta) / (2 * a)).toFixed(6));
        return { real, imag, tipo: 'complexas' };
    }
}

function calcularVertice(a, b, c) {
    const x = -b / (2 * a);
    const y = a * x * x + b * x + c;
    return { x: parseFloat(x.toFixed(6)), y: parseFloat(y.toFixed(6)) };
}

function formatarNumero(num) {
    return Math.abs(num) < 0.000001 ? '0' : num.toFixed(4);
}

function gerarExplicacao(a, b, c, delta, raizes) {
    const bFormatado = b >= 0 ? `+${formatarNumero(b)}` : formatarNumero(b);
    const cFormatado = c >= 0 ? `+${formatarNumero(c)}` : formatarNumero(c);

    let explicacao = `
        <div class="formula-bhaskara mb-2">
            \\[${formatarNumero(a)}x^2 ${bFormatado}x ${cFormatado} = 0\\]
        </div>
        <p><strong>Discriminante (Δ):</strong> Δ = b² - 4ac = ${formatarNumero(b)}^2 - 4⋅${formatarNumero(a)}⋅${formatarNumero(c)} = <strong>${formatarNumero(delta)}</strong></p>
    `;

    if (delta > 0) {
        explicacao += `
            <p><strong>Duas raízes reais distintas:</strong></p>
            <div class="formula-bhaskara">
                \\[x_1 = \\frac{-${formatarNumero(b)} + \\sqrt{${formatarNumero(delta)}}}{2⋅${formatarNumero(a)}} = ${formatarNumero(raizes.x1)}\\]
            </div>
            <div class="formula-bhaskara">
                \\[x_2 = \\frac{-${formatarNumero(b)} - \\sqrt{${formatarNumero(delta)}}}{2⋅${formatarNumero(a)}} = ${formatarNumero(raizes.x2)}\\]
            </div>`;
    } else if (delta === 0) {
        explicacao += `
            <p><strong>Uma raiz real dupla:</strong></p>
            <div class="formula-bhaskara">
                \\[x = \\frac{-${formatarNumero(b)}}{2⋅${formatarNumero(a)}} = ${formatarNumero(raizes.x1)}\\]
            </div>`;
    } else {
        explicacao += `
            <p><strong>Raízes complexas:</strong> Não existem raízes reais. A parábola não cruza o eixo X.</p>
            <div class="formula-bhaskara">
                \\[x = ${formatarNumero(raizes.real)} \\pm ${formatarNumero(raizes.imag)}i\\]
            </div>
            <p><em>Raízes complexas ocorrem quando Δ < 0, indicando que a parábola está totalmente acima ou abaixo do eixo X.</em></p>`;
    }

    const vertice = calcularVertice(a, b, c);
    explicacao += `
        <p><strong>Vértice:</strong> (${formatarNumero(vertice.x)}, ${formatarNumero(vertice.y)})</p>`;

    return explicacao;
}

function gerarDadosGrafico(a, b, c, raizes) {
    const dados = [];
    const minX = Math.min(-10, raizes.x1 - 5 || -10, raizes.x2 - 5 || -10);
    const maxX = Math.max(10, raizes.x1 + 5 || 10, raizes.x2 + 5 || 10);

    for (let x = minX; x <= maxX; x += 0.1) {
        const y = a * x * x + b * x + c;
        dados.push({ x, y });
    }

    return { dados, raizes, limiteX: [minX, maxX] };
}

function criarGrafico(dadosGrafico, a, b, c) {
    const ctx = document.getElementById('graficoParabola').getContext('2d');
    if (chart) chart.destroy();

    const config = {
        type: 'line',
        data: {
            datasets: [{
                label: 'y = ax² + bx + c',
                data: dadosGrafico.dados.map(p => ({ x: p.x, y: p.y })),
                borderColor: 'rgb(255, 149, 0)',
                backgroundColor: 'rgba(255, 149, 0, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'x' }
                },
                y: {
                    title: { display: true, text: 'y' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                        }
                    }
                }
            }
        }
    };

    chart = new Chart(ctx, config);

    if (dadosGrafico.raizes.tipo !== 'complexas') {
        chart.data.datasets.push({
            label: 'Raiz x₁',
            data: [{ x: dadosGrafico.raizes.x1, y: 0 }],
            backgroundColor: 'rgb(74, 222, 128)',
            pointRadius: 8,
            pointHoverRadius: 10,
            showLine: false
        });
        if (dadosGrafico.raizes.x1 !== dadosGrafico.raizes.x2) {
            chart.data.datasets.push({
                label: 'Raiz x₂',
                data: [{ x: dadosGrafico.raizes.x2, y: 0 }],
                backgroundColor: 'rgb(59, 130, 246)',
                pointRadius: 8,
                pointHoverRadius: 10,
                showLine: false
            });
        }
    }

    const vertice = calcularVertice(a, b, c);
    chart.data.datasets.push({
        label: 'Vértice',
        data: [{ x: vertice.x, y: vertice.y }],
        backgroundColor: 'rgb(168, 85, 247)',
        pointRadius: 10,
        pointHoverRadius: 12,
        showLine: false
    });

    chart.update();
}

function salvarHistorico(a, b, c, raizes) {
    const item = {
        a, b, c, raizes,
        data: new Date().toLocaleString('pt-BR')
    };
    historico.unshift(item);
    localStorage.setItem('historicoEquacoes', JSON.stringify(historico));
    atualizarHistorico();
}

function atualizarHistorico() {
    const container = document.getElementById('historico');
    container.innerHTML = '';
    historico.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        const raizesTexto = item.raizes.tipo === 'complexas' ?
            `x = ${formatarNumero(item.raizes.real)} ± ${formatarNumero(item.raizes.imag)}i` :
            `x₁ = ${formatarNumero(item.raizes.x1)}, x₂ = ${formatarNumero(item.raizes.x2)}`;
        div.innerHTML = `
            <div>
                <strong>${formatarNumero(item.a)}x² ${item.b >= 0 ? '+' : ''}${formatarNumero(item.b)}x ${item.c >= 0 ? '+' : ''}${formatarNumero(item.c)} = 0</strong><br>
                <small>${item.data} | ${raizesTexto}</small>
            </div>
            <button class="delete-btn" onclick="removerHistorico(${index})">Excluir</button>
        `;
        container.appendChild(div);
    });
}

function removerHistorico(index) {
    historico.splice(index, 1);
    localStorage.setItem('historicoEquacoes', JSON.stringify(historico));
    atualizarHistorico();
}

function calcularEquacao() {
    const a = parseFloat(document.getElementById('a').value);
    const b = parseFloat(document.getElementById('b').value);
    const c = parseFloat(document.getElementById('c').value);

    if (!validarInputs(a, b, c)) return;

    const delta = calcularDelta(a, b, c);
    const raizes = calcularRaizes(a, b, c, delta);

    document.getElementById('explicacao').innerHTML = gerarExplicacao(a, b, c, delta, raizes);
    setTimeout(() => MathJax.typesetPromise([document.getElementById('explicacao')]), 100);

    const dadosGrafico = gerarDadosGrafico(a, b, c, raizes);
    criarGrafico(dadosGrafico, a, b, c);

    salvarHistorico(a, b, c, raizes);
    mostrarAlerta('Cálculo realizado com sucesso!', 'success');
}

function limparTudo() {
    document.getElementById('a').value = '';
    document.getElementById('b').value = '';
    document.getElementById('c').value = '';
    document.getElementById('explicacao').innerHTML = '';
    if (chart) chart.destroy();
    pararVoz();
}

atualizarHistorico();
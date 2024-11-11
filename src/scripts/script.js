async function carregarEstados() {
    try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const estados = await response.json();
        const selectEstado = document.getElementById('estado'); 
        estados.forEach(estado => {
            const option = document.createElement('option');  
            option.value = estado.id;
            option.textContent = estado.nome;  
            selectEstado.appendChild(option);  
        });
    } catch (error) {
        console.error('Erro ao carregar estados:', error);
    }
}

async function carregarCidades(estadoId) {
    try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`);
        const cidades = await response.json();
        const selectCidade = document.getElementById('cidade');
        selectCidade.innerHTML = '<option value="">Selecione uma cidade</option>'; // Limpa as cidades
        cidades.forEach(cidade => {
            const option = document.createElement('option');  
            option.value = cidade.nome; 
            option.textContent = cidade.nome;  
            selectCidade.appendChild(option);  
        });
    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
    }
}

function atualizarDataAtual() {
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    document.getElementById('dataAtual').textContent = `Data Atual: ${dataAtual}`;
}

async function buscarDados() {
    const apiKey = "e7e6d81a4af74035ba4234826240911";
    const cidade = document.getElementById('cidade').value;

    if (cidade) {
        try {
            // Chamada para API de previsão do tempo e qualidade do ar
            const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cidade}&days=1&aqi=yes&alerts=yes&lang=pt`);
            const data = await response.json();
            console.log('Dados recebidos:', data);

            // Exibindo dados de qualidade do ar
            if (data.current && data.current.air_quality) {
                const airQuality = data.current.air_quality;
                const qualidadeArContainer = document.getElementById('qualidadeAr');
                qualidadeArContainer.innerHTML = `
                    <h1>Qualidade do Ar</h1>
                    <p>Índice GB-DEFRA: ${airQuality['gb-defra-index']}</p>
                    <p>
                        CO: ${airQuality.co}, NO2: ${airQuality.no2}, O3: ${airQuality.o3},
                        PM2.5: ${airQuality.pm2_5}, PM10: ${airQuality.pm10}, SO2: ${airQuality.so2}
                    </p>
                `;
            } else {
                document.getElementById('qualidadeAr').innerHTML = `
                    <h3>Qualidade do Ar em ${cidade}</h3>
                    <p>Dados não disponíveis</p>
                `;
            }

            // Atualizando a tabela com a previsão do tempo
            const tbody = document.getElementById('previsao').querySelector('tbody');
            tbody.innerHTML = ''; // Limpa a tabela antes de preencher

            data.forecast.forecastday[0].hour.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.time.split(' ')[1]}</td>
                    <td>${item.condition.text}</td>
                    <td>${item.chance_of_rain !== undefined ? item.chance_of_rain : 'N/A'}</td>
                    <td>${item.temp_c}</td>
                    <td>${item.feelslike_c}</td>
                    <td>${item.humidity}</td>
                    <td>${item.wind_kph}</td>
                `;
                tbody.appendChild(row);
            });

            // Atualizando informações do relatório
            gerarRelatorio();
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }
}

function gerarRelatorio() {
    const info = document.getElementById('info');
    const estado = document.getElementById('estado').options[document.getElementById('estado').selectedIndex].text;
    const cidade = document.getElementById('cidade').value;
    
    info.textContent = `Relatório de Previsão do Tempo para ${cidade}, ${estado}`;
}

async function salvarPDF() {
    const elemento = document.getElementById('relatorio');
    const options = {
        margin: [10, 10, 10, 10],
        filename: 'relatorio_previsao_tempo.pdf',
        image: { type: 'png', quality: 1 },
        html2canvas: { scale: 1 },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'landscape',
        }
    };
    await html2pdf().set(options).from(elemento).save();
}

// Event Listeners
document.getElementById('estado').addEventListener('change', function() {
    carregarCidades(this.value);
});

document.getElementById('cidade').addEventListener('change', buscarDados);
document.getElementById('salvar').addEventListener('click', salvarPDF);

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarEstados();
    atualizarDataAtual();
});
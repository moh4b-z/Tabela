document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('interactive-table');
    const modal = document.getElementById('modal');
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('data-form');
    const infoDiv = document.getElementById('info');
    const analyzeBtn = document.getElementById('analyze-btn');
    const createBaseBtn = document.getElementById('create-base-btn');
    const downloadBtn = document.getElementById('download-btn');
    const fileInput = document.getElementById('file-input');
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    document.body.appendChild(tooltip);

    let selectedCell;
    let filledCellsCount = 0;
    let pendingCellsCount = 0;
    let storedData = {};

    // Adicionar evento ao botão "Analisar Arquivo"
    analyzeBtn.addEventListener('click', () => {
        fileInput.click(); // Abre o seletor de arquivos
    });

    // Adicionar evento ao seletor de arquivos
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    storedData = JSON.parse(event.target.result);
                    generateTable();
                } catch (error) {
                    alert('O arquivo selecionado não é um arquivo JSON válido.');
                }
            };
            reader.readAsText(file);
        }
    });

    // Adicionar evento ao botão "Criar Arquivo Base"
    createBaseBtn.addEventListener('click', () => {
        const baseData = {};
        saveToFile(baseData, true);
    });

    // Função para gerar a tabela
    function generateTable() {
        table.innerHTML = ''; // Limpa a tabela existente

        for (let i = 0; i < 20; i++) {
            let row = table.insertRow();
            for (let j = 0; j < 20; j++) {
                let cell = row.insertCell();
                let cellNumber = i * 20 + j + 1;
                cell.textContent = cellNumber;
                
                const data = storedData[cellNumber];
                if (data) {
                    if (data.name && data.phone && data.paymentStatus) {
                        cell.style.backgroundColor = 'green';
                        filledCellsCount++;
                    } else if (data.name && data.phone) {
                        cell.style.backgroundColor = 'yellow';
                        pendingCellsCount++;
                    }
                }

                cell.addEventListener('click', () => {
                    selectedCell = cellNumber;
                    modal.style.display = 'block';
                    if (data) {
                        document.getElementById('name').value = data.name;
                        document.getElementById('phone').value = data.phone;
                        document.getElementById('payment-status').value = data.paymentStatus;
                    } else {
                        form.reset();
                    }
                });

                cell.addEventListener('mouseover', (e) => {
                    const data = storedData[cellNumber];
                    if (data && data.name && data.phone) {
                        tooltip.innerHTML = `Nome: ${data.name}<br>Telefone: ${data.phone}<br>Estado de Pagamento: ${data.paymentStatus || 'Não informado'}`;
                    } else {
                        tooltip.innerHTML = 'Nenhuma informação';
                    }
                    tooltip.style.display = 'block';
                    tooltip.style.left = `${e.pageX + 10}px`;  // Posição do tooltip
                    tooltip.style.top = `${e.pageY + 10}px`;
                });

                cell.addEventListener('mouseout', () => {
                    tooltip.style.display = 'none';
                });
            }
        }

        // Atualizar informações sobre números preenchidos e pendentes
        updateInfo(filledCellsCount, pendingCellsCount);
    }

    // Fechar o modal
    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }

    // Submeter os dados e armazenar no arquivo .txt
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            paymentStatus: document.getElementById('payment-status').value
        };

        if (data.name && data.phone) {
            const isValid = data.paymentStatus || (!data.paymentStatus && data.name && data.phone);
            if (!isValid) {
                alert('Preencha todos os campos ou deixe o campo "Estado de Pagamento" em branco.');
                return;
            }

            storedData[selectedCell] = data;
            saveToFile(storedData);

            updateTableCellColor(selectedCell, data);
            filledCellsCount = 0;
            pendingCellsCount = 0;
            Object.values(storedData).forEach(data => {
                if (data.name && data.phone && data.paymentStatus) {
                    filledCellsCount++;
                } else if (data.name && data.phone) {
                    pendingCellsCount++;
                }
            });
            updateInfo(filledCellsCount, pendingCellsCount);
            modal.style.display = 'none';
        } else {
            alert('Nome e Telefone são obrigatórios.');
        }
    });

    // Função para baixar o arquivo .txt
    downloadBtn.addEventListener('click', () => {
        saveToFile(storedData, true);
    });
});

// Função para atualizar a cor da célula na tabela 20x20
function updateTableCellColor(cellNumber, data) {
    const cell = Array.from(document.getElementsByTagName('td')).find(td => td.textContent == cellNumber);
    if (data.name && data.phone && data.paymentStatus) {
        cell.style.backgroundColor = 'green';
    } else if (data.name && data.phone) {
        cell.style.backgroundColor = 'yellow';
    }
}

// Função para atualizar informações de células preenchidas e pendentes
function updateInfo(filledCells, pendingCells) {
    document.getElementById('info').innerHTML = `Números preenchidos: ${filledCells} <br> Números pendentes: ${pendingCells}`;
}

// Função para salvar os dados em um arquivo .txt
function saveToFile(data, forceDownload = false) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    if (forceDownload) {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tableData.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    URL.revokeObjectURL(url);
}

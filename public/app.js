const aparelhos = [];
const form = document.querySelector('#form-aparelho');
const lista = document.querySelector('#lista-aparelhos');
const saida = document.querySelector('#resultado');
const erroP = document.querySelector('#erro');

function desenharLista() {
  lista.innerHTML = ''; 
  
  if (aparelhos.length === 0) {
    const li = document.createElement('li');
    li.className = 'list-empty';
    li.textContent = 'Nenhum equipamento na memória de cálculo.';
    lista.appendChild(li);
    return;
  }

  aparelhos.forEach((a, index) => {
    const li = document.createElement('li');
    
    const nome = document.createElement('span');
    nome.className = 'item-name';
    nome.textContent = a.nome;
    
    const potencia = document.createElement('span');
    potencia.textContent = `${a.potenciaW} W`;
    
    const horas = document.createElement('span');
    horas.textContent = `${a.horasDia} h/dia`;
    
    const dias = document.createElement('span');
    dias.textContent = `${a.diasMes} dias`;
    
    const btnRemover = document.createElement('button');
    btnRemover.textContent = 'X';
    btnRemover.className = 'btn-remover';
    btnRemover.title = 'Remover equipamento';
    btnRemover.addEventListener('click', () => {
      aparelhos.splice(index, 1);
      desenharLista();
    });

    li.appendChild(nome);
    li.appendChild(potencia);
    li.appendChild(horas);
    li.appendChild(dias);
    li.appendChild(btnRemover);
    lista.appendChild(li);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault(); 
  
  const nome = document.querySelector('#nome').value;
  const potenciaW = Number(document.querySelector('#potencia').value);
  const horasDia = Number(document.querySelector('#horas').value);
  const diasMes = Number(document.querySelector('#dias').value);

  aparelhos.push({ nome, potenciaW, horasDia, diasMes });
  form.reset();
  desenharLista();
});

const money = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

document.querySelector('#btn-simular').addEventListener('click', async () => {
  erroP.textContent = '';
  saida.innerHTML = '';
  saida.classList.add('hidden');

  if (aparelhos.length === 0) {
    erroP.textContent = 'ERRO: Memória de cálculo vazia. Insira equipamentos.';
    return;
  }

  try {
    const resposta = await fetch('/api/simular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aparelhos })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      erroP.textContent = `ERRO: ${dados.erro}`;
      return;
    }

    saida.classList.remove('hidden'); 

    const titulo = document.createElement('h2');
    titulo.className = 'report-title';
    titulo.textContent = 'RESULTADO DA ANÁLISE';
    saida.appendChild(titulo);

    const grid = document.createElement('div');
    grid.className = 'receipt-grid';

    const items = [
      { label: 'Consumo Total', value: `${dados.consumoKwhMes} kWh`, desc: 'Média mensal', class: '' },
      { label: 'Custo Estimado', value: money(dados.totalMes), desc: 'Tarifa + Bandeira', class: '' },
      { label: 'Dimensionamento Solar', value: `${dados.paineisNecessarios} painéis`, desc: 'Fator 0.80 aplicado', class: '' },
      { label: 'Maior Consumidor', value: dados.aparelhoMaisCaro.nome, desc: money(dados.aparelhoMaisCaro.custo), class: 'alert' }
    ];

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'receipt-block';
      
      const lbl = document.createElement('div');
      lbl.className = 'receipt-label';
      lbl.textContent = item.label;
      
      const val = document.createElement('div');
      val.className = `receipt-value ${item.class}`;
      val.textContent = item.value;
      
      const dsc = document.createElement('div');
      dsc.className = 'receipt-desc';
      dsc.textContent = item.desc;

      div.appendChild(lbl);
      div.appendChild(val);
      div.appendChild(dsc);
      grid.appendChild(div);
    });

    saida.appendChild(grid);

    const tabela = document.createElement('table');
    const cabecalho = document.createElement('tr');
    ['Equipamento', 'kWh/mês', 'Custo (R$)', '%'].forEach(tituloColuna => {
      const th = document.createElement('th');
      th.textContent = tituloColuna;
      cabecalho.appendChild(th);
    });
    tabela.appendChild(cabecalho);

    dados.detalhes.forEach(d => {
      const tr = document.createElement('tr');
      
      const tdNome = document.createElement('td');
      tdNome.textContent = d.nome;
      
      const tdKwh = document.createElement('td');
      tdKwh.textContent = d.kwhMes;
      
      const tdCusto = document.createElement('td');
      tdCusto.textContent = money(d.custo);
      
      const tdPercent = document.createElement('td');
      tdPercent.textContent = `${d.percentual.toFixed(1)}%`;

      tr.appendChild(tdNome);
      tr.appendChild(tdKwh);
      tr.appendChild(tdCusto);
      tr.appendChild(tdPercent);
      tabela.appendChild(tr);
    });
    
    saida.appendChild(tabela);

  } catch (erro) {
    erroP.textContent = 'ERRO DE SISTEMA: Falha na conexão com o servidor Node.js.';
  }
});

desenharLista();
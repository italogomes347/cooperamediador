const cfg = require('./config');

function consumoMensalKwh(aparelho) {
  return (aparelho.potenciaW * aparelho.horasDia * aparelho.diasMes) / 1000;
}

function custoEnergia(kwh) {
  return kwh * cfg.TARIFA_KWH;
}

function adicionalBandeira(kwh) {
  return (kwh / 100) * cfg.VALORES_BANDEIRA[cfg.BANDEIRA];
}

function paineisNecessarios(kwh) {
  const geracaoPorPainel = (cfg.POTENCIA_PAINEL_W / 1000) * cfg.HSP * 30 * cfg.EFICIENCIA;
  return Math.ceil(kwh / geracaoPorPainel);
}

const r2 = (v) => Math.round(v * 100) / 100;

function simular(aparelhos) {
  const detalhes = aparelhos.map((a) => {
    const kwhMes = consumoMensalKwh(a);
    const custo = custoEnergia(kwhMes);
    return { nome: a.nome, kwhMes, custo };
  });

  const consumoTotal = detalhes.reduce((soma, d) => soma + d.kwhMes, 0);

  detalhes.forEach((d) => {
    d.percentual = consumoTotal > 0 ? (d.kwhMes / consumoTotal) * 100 : 0;
  });

  const cEnergia = custoEnergia(consumoTotal);
  const aBandeira = adicionalBandeira(consumoTotal);
  const total = cEnergia + aBandeira;

  let maisCaro = detalhes[0];
  detalhes.forEach((d) => {
    if (d.custo > maisCaro.custo) maisCaro = d;
  });

  return {
    consumoKwhMes: r2(consumoTotal),
    custoEnergia: r2(cEnergia),
    adicionalBandeira: r2(aBandeira),
    totalMes: r2(total),
    paineisNecessarios: paineisNecessarios(consumoTotal),
    aparelhoMaisCaro: { nome: maisCaro.nome, custo: r2(maisCaro.custo) },
    detalhes: detalhes.map((d) => ({
      nome: d.nome,
      kwhMes: r2(d.kwhMes),
      custo: r2(d.custo),
      percentual: r2(d.percentual),
    })),
  };
}

module.exports = { consumoMensalKwh, custoEnergia, adicionalBandeira, paineisNecessarios, simular };
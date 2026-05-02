import type { Cliente } from '@/types'

const clientesMock: Cliente[] = [
  { id: 'c001', nome: 'Agropecuária Boa Vista Ltda', cpf_cnpj: '12.345.678/0001-90', telefone: '(66) 3541-2210', email: 'financeiro@boavistaagro.com.br', cidade: 'Sorriso', estado: 'MT', cultura_principal: 'Soja', area_hectares: 12400, faturamento_anual: 85200000, potencial_compra: 4250000, ultima_compra: '2025-04-15', status: 'ativo', produtos: { sementes: { nome: 'Sementes Soja', quantidade: 1800, valor_total: 3240000 } } },
  { id: 'c002', nome: 'Fazenda São João do Cerrado', cpf_cnpj: '23.456.789/0001-01', telefone: '(67) 3245-8800', email: 'admin@fazendacerrado.com.br', cidade: 'Chapadão do Sul', estado: 'MS', cultura_principal: 'Milho', area_hectares: 8700, faturamento_anual: 41500000, potencial_compra: 2100000, ultima_compra: '2025-03-20', status: 'ativo', produtos: { sementes: { nome: 'Sementes Milho', quantidade: 1200, valor_total: 2160000 }, fertilizantes: { nome: 'Fertilizantes', quantidade: 400, valor_total: 1280000 } } },
  { id: 'c003', nome: 'Usina Itaipava Agroenergia', cpf_cnpj: '34.567.890/0001-12', telefone: '(16) 3931-4455', email: 'compras@itaipavaenergia.com.br', cidade: 'Ribeirão Preto', estado: 'SP', cultura_principal: 'Cana-de-Açúcar', area_hectares: 22000, faturamento_anual: 198000000, potencial_compra: 9800000, ultima_compra: '2025-05-01', status: 'ativo', produtos: { defensivos: { nome: 'Defensivos Cana', quantidade: 800, valor_total: 4800000 }, maquinario: { nome: 'Maquinario Pesado', quantidade: 3, valor_total: 5600000 } } },
  { id: 'c004', nome: 'Café Mantiqueira Exportação', cpf_cnpj: '45.678.901/0001-23', telefone: '(35) 3271-1133', email: 'export@cafemantiqueira.com.br', cidade: 'Varginha', estado: 'MG', cultura_principal: 'Café', area_hectares: 2500, faturamento_anual: 38400000, potencial_compra: 1920000, ultima_compra: '2025-04-28', status: 'ativo', produtos: { fertilizantes: { nome: 'Adubos Especiais', quantidade: 95, valor_total: 1520000 } } },
  { id: 'c005', nome: 'Algodoeira Oeste Baiano S/A', cpf_cnpj: '56.789.012/0001-34', telefone: '(77) 3612-7700', email: 'sac@algodoeiraoeste.com.br', cidade: 'Luís Eduardo Magalhães', estado: 'BA', cultura_principal: 'Algodão', area_hectares: 15000, faturamento_anual: 127000000, potencial_compra: 6350000, ultima_compra: '2025-02-14', status: 'ativo', produtos: { sementes: { nome: 'Sementes Algodão', quantidade: 2500, valor_total: 4500000 }, defensivos: { nome: 'Inseticidas', quantidade: 600, valor_total: 3100000 } } },
  { id: 'c006', nome: 'Pecuária Nova Fronteira', cpf_cnpj: '67.890.123/0001-45', telefone: '(63) 3412-5500', email: 'vendas@novafronteirapec.com.br', cidade: 'Araguaína', estado: 'TO', cultura_principal: 'Pecuária de Corte', area_hectares: 35000, faturamento_anual: 56300000, potencial_compra: 2800000, ultima_compra: '2025-03-05', status: 'ativo', produtos: { suplementacao: { nome: 'Suplementacao Mineral', quantidade: 1200, valor_total: 960000 } } },
  { id: 'c007', nome: 'Cooperativa Agroindustrial Copagri', cpf_cnpj: '78.901.234/0001-56', telefone: '(44) 3262-9900', email: 'diretoria@copagri.com.br', cidade: 'Maringá', estado: 'PR', cultura_principal: 'Soja', area_hectares: 28000, faturamento_anual: 215000000, potencial_compra: 10800000, ultima_compra: '2025-05-02', status: 'ativo', produtos: { sementes: { nome: 'Sementes Soja + Milho', quantidade: 4200, valor_total: 7560000 }, defensivos: { nome: 'Defensivos Diversos', quantidade: 1500, valor_total: 4200000 } } },
  { id: 'c008', nome: 'Fruticultura Serrana Orgânicos', cpf_cnpj: '89.012.345/0001-67', telefone: '(54) 3245-1122', email: 'contato@frutiserrana.com.br', cidade: 'Vacaria', estado: 'RS', cultura_principal: 'Fruticultura', area_hectares: 980, faturamento_anual: 12300000, potencial_compra: 615000, ultima_compra: '2025-04-10', status: 'ativo', produtos: { fertilizantes: { nome: 'Fertilizantes Organicos', quantidade: 220, valor_total: 330000 } } },
  { id: 'c009', nome: 'Agrícola Planalto Goiano', cpf_cnpj: '90.123.456/0001-78', telefone: '(62) 3431-6600', email: 'adm@planaltogoiano.com.br', cidade: 'Rio Verde', estado: 'GO', cultura_principal: 'Milho', area_hectares: 6200, faturamento_anual: 28700000, potencial_compra: 1435000, ultima_compra: '2025-01-30', status: 'inativo', produtos: {} },
  { id: 'c010', nome: 'Sementes Triângulo Mineiro', cpf_cnpj: '01.234.567/0001-89', telefone: '(34) 3221-4455', email: 'financeiro@sementesminas.com.br', cidade: 'Uberlândia', estado: 'MG', cultura_principal: 'Soja', area_hectares: 4100, faturamento_anual: 31200000, potencial_compra: 1560000, ultima_compra: '2025-04-22', status: 'ativo', produtos: { sementes: { nome: 'Sementes Certificadas', quantidade: 600, valor_total: 1200000 } } },
  { id: 'c011', nome: 'Bioenergia Pontal Ltda', cpf_cnpj: '11.234.567/0001-01', telefone: '(34) 3891-2200', email: 'contato@bioenergiapontal.com.br', cidade: 'Ituiutaba', estado: 'MG', cultura_principal: 'Cana-de-Açúcar', area_hectares: 9100, faturamento_anual: 73000000, potencial_compra: 3650000, ultima_compra: '2025-04-30', status: 'ativo', produtos: { defensivos: { nome: 'Herbicidas Seletivos', quantidade: 320, valor_total: 1760000 }, maquinario: { nome: 'Colhedoras', quantidade: 1, valor_total: 1800000 } } },
  { id: 'c012', nome: 'Fazenda Bela Vista Agroflorestal', cpf_cnpj: '22.345.678/0001-12', telefone: '(69) 3241-3300', email: 'contato@belavistaflorestal.com.br', cidade: 'Ji-Paraná', estado: 'RO', cultura_principal: 'Pecuária Leiteira', area_hectares: 4200, faturamento_anual: 9800000, potencial_compra: 490000, ultima_compra: '2025-03-12', status: 'prospect', produtos: {} },
  { id: 'c013', nome: 'Arrozeira Gaúcha Exportação', cpf_cnpj: '33.456.789/0001-23', telefone: '(53) 3251-8800', email: 'export@arrozeiragaucha.com.br', cidade: 'Pelotas', estado: 'RS', cultura_principal: 'Arroz', area_hectares: 5500, faturamento_anual: 19200000, potencial_compra: 960000, ultima_compra: '2025-04-18', status: 'ativo', produtos: { sementes: { nome: 'Sementes Arroz Irrigado', quantidade: 400, valor_total: 640000 } } },
  { id: 'c014', nome: 'Agro Campos Gerais S/A', cpf_cnpj: '44.567.890/0001-34', telefone: '(42) 3229-5500', email: 'financeiro@agrocamposgerais.com.br', cidade: 'Ponta Grossa', estado: 'PR', cultura_principal: 'Feijão', area_hectares: 3200, faturamento_anual: 15600000, potencial_compra: 780000, ultima_compra: '2025-04-05', status: 'ativo', produtos: { fertilizantes: { nome: 'NPK Granulado', quantidade: 280, valor_total: 560000 } } },
  { id: 'c015', nome: 'Hortifrúti Orgânico Chapada', cpf_cnpj: '55.678.901/0001-45', telefone: '(75) 3621-4400', email: 'vendas@hortichapada.com.br', cidade: 'Lençóis', estado: 'BA', cultura_principal: 'Fruticultura', area_hectares: 340, faturamento_anual: 4300000, potencial_compra: 215000, ultima_compra: '2025-05-01', status: 'prospect', produtos: {} },
  { id: 'c016', nome: 'Fazenda Santa Terezinha', cpf_cnpj: '66.789.012/0001-56', telefone: '(68) 3461-2200', email: 'fazenda@santaterezinha.com.br', cidade: 'Rio Branco', estado: 'AC', cultura_principal: 'Mandioca', area_hectares: 1800, faturamento_anual: 6400000, potencial_compra: 320000, ultima_compra: '2025-02-20', status: 'inativo', produtos: {} },
  { id: 'c017', nome: 'Citrus Nordeste Export Ltda', cpf_cnpj: '77.890.123/0001-67', telefone: '(79) 3241-5500', email: 'export@citrusne.com.br', cidade: 'Lagarto', estado: 'SE', cultura_principal: 'Laranja', area_hectares: 2100, faturamento_anual: 18700000, potencial_compra: 935000, ultima_compra: '2025-04-25', status: 'ativo', produtos: { defensivos: { nome: 'Fungicidas Citricos', quantidade: 85, valor_total: 510000 } } },
  { id: 'c018', nome: 'Agropecuária Vale do Araguaia', cpf_cnpj: '88.901.234/0001-78', telefone: '(66) 3521-7700', email: 'contato@valearaguaia.com.br', cidade: 'Barra do Garças', estado: 'MT', cultura_principal: 'Pecuária de Corte', area_hectares: 48000, faturamento_anual: 74500000, potencial_compra: 3725000, ultima_compra: '2025-03-28', status: 'ativo', produtos: { suplementacao: { nome: 'Ração Concentrada', quantidade: 1800, valor_total: 1440000 }, medicamentos: { nome: 'Vermífugos e Vacinas', quantidade: 2500, valor_total: 750000 } } },
  { id: 'c019', nome: 'Floresta Verde Reflorestamento', cpf_cnpj: '99.012.345/0001-89', telefone: '(63) 3419-3300', email: 'adm@florestaverde.com.br', cidade: 'Gurupi', estado: 'TO', cultura_principal: 'Eucalipto', area_hectares: 8500, faturamento_anual: 22400000, potencial_compra: 1120000, ultima_compra: '2025-04-12', status: 'prospect', produtos: {} },
  { id: 'c020', nome: 'Grãos Maranhão Comércio Ltda', cpf_cnpj: '10.345.678/0001-90', telefone: '(99) 3521-4400', email: 'vendas@graosma.com.br', cidade: 'Balsas', estado: 'MA', cultura_principal: 'Soja', area_hectares: 19000, faturamento_anual: 142000000, potencial_compra: 7100000, ultima_compra: '2025-04-29', status: 'ativo', produtos: { sementes: { nome: 'Sementes Soja RR', quantidade: 2800, valor_total: 5040000 }, fertilizantes: { nome: 'Fosfatados', quantidade: 950, valor_total: 3040000 } } },
  { id: 'c021', nome: 'Cacaueira do Sul da Bahia', cpf_cnpj: '21.456.789/0001-01', telefone: '(73) 3281-2200', email: 'contato@cacaubahia.com.br', cidade: 'Ilhéus', estado: 'BA', cultura_principal: 'Cacau', area_hectares: 1200, faturamento_anual: 15800000, potencial_compra: 790000, ultima_compra: '2025-04-08', status: 'ativo', produtos: { fertilizantes: { nome: 'Adubo Cacau', quantidade: 60, valor_total: 360000 } } },
  { id: 'c022', nome: 'Vitivinícola Serra Gaúcha', cpf_cnpj: '32.567.890/0001-12', telefone: '(54) 3461-3300', email: 'contato@vinhoserragaucha.com.br', cidade: 'Bento Gonçalves', estado: 'RS', cultura_principal: 'Uva', area_hectares: 650, faturamento_anual: 24800000, potencial_compra: 1240000, ultima_compra: '2025-03-22', status: 'ativo', produtos: { defensivos: { nome: 'Fungicidas Vinicultura', quantidade: 35, valor_total: 245000 } } },
  { id: 'c023', nome: 'Agroindústria Paranaíba', cpf_cnpj: '43.678.901/0001-23', telefone: '(44) 3652-4400', email: 'compras@agroparanaiba.com.br', cidade: 'Umuarama', estado: 'PR', cultura_principal: 'Mandioca', area_hectares: 2500, faturamento_anual: 8300000, potencial_compra: 415000, ultima_compra: '2025-04-15', status: 'inativo', produtos: {} },
  { id: 'c024', nome: 'Fazenda São Francisco da Mata', cpf_cnpj: '54.789.012/0001-34', telefone: '(34) 3812-6600', email: 'fazenda@sfsm.com.br', cidade: 'Patos de Minas', estado: 'MG', cultura_principal: 'Soja', area_hectares: 5100, faturamento_anual: 37300000, potencial_compra: 1865000, ultima_compra: '2025-04-20', status: 'ativo', produtos: { sementes: { nome: 'Sementes Milho Safrinha', quantidade: 720, valor_total: 1296000 } } },
  { id: 'c025', nome: 'Agrícola Piauí Cerrado', cpf_cnpj: '65.890.123/0001-45', telefone: '(89) 3561-2200', email: 'contato@agropiaui.com.br', cidade: 'Uruçuí', estado: 'PI', cultura_principal: 'Algodão', area_hectares: 7200, faturamento_anual: 54500000, potencial_compra: 2725000, ultima_compra: '2025-04-01', status: 'prospect', produtos: {} },
  { id: 'c026', nome: 'Palma Óleos Vegetais S/A', cpf_cnpj: '76.901.234/0001-56', telefone: '(91) 3241-5500', email: 'sac@palmaoleos.com.br', cidade: 'Tailândia', estado: 'PA', cultura_principal: 'Dendê', area_hectares: 6200, faturamento_anual: 34500000, potencial_compra: 1725000, ultima_compra: '2025-03-14', status: 'ativo', produtos: { fertilizantes: { nome: 'Adubação de Palma', quantidade: 310, valor_total: 930000 } } },
  { id: 'c027', nome: 'Cerealistas Trigo & Cia', cpf_cnpj: '87.012.345/0001-67', telefone: '(51) 3521-3300', email: 'financeiro@trigoecia.com.br', cidade: 'Passo Fundo', estado: 'RS', cultura_principal: 'Trigo', area_hectares: 3800, faturamento_anual: 14300000, potencial_compra: 715000, ultima_compra: '2025-04-17', status: 'prospect', produtos: {} },
  { id: 'c028', nome: 'Agropecuária Paranaense Ltda', cpf_cnpj: '98.123.456/0001-78', telefone: '(43) 3321-4400', email: 'adm@agroparanaense.com.br', cidade: 'Londrina', estado: 'PR', cultura_principal: 'Soja', area_hectares: 4900, faturamento_anual: 35800000, potencial_compra: 1790000, ultima_compra: '2025-04-24', status: 'ativo', produtos: { sementes: { nome: 'Sementes Soja IPRO', quantidade: 720, valor_total: 1296000 } } },
  { id: 'c029', nome: 'Fazenda Bom Retiro Pecuária', cpf_cnpj: '09.234.567/0001-89', telefone: '(67) 3261-8800', email: 'bomretiro@agns.com.br', cidade: 'Campo Grande', estado: 'MS', cultura_principal: 'Pecuária de Corte', area_hectares: 9600, faturamento_anual: 18400000, potencial_compra: 920000, ultima_compra: '2025-02-28', status: 'inativo', produtos: {} },
  { id: 'c030', nome: 'Agrícola Matogrossense do Norte', cpf_cnpj: '20.345.678/0001-90', telefone: '(66) 3531-5500', email: 'compras@agromt.com.br', cidade: 'Sinop', estado: 'MT', cultura_principal: 'Milho', area_hectares: 11200, faturamento_anual: 52600000, potencial_compra: 2630000, ultima_compra: '2025-04-19', status: 'ativo', produtos: { sementes: { nome: 'Sementes Milho BT', quantidade: 1600, valor_total: 2880000 } } },
  { id: 'c031', nome: 'Fazenda Rincão Gaúcho', cpf_cnpj: '31.456.789/0001-01', telefone: '(55) 3241-2200', email: 'admin@rincaogaucho.com.br', cidade: 'Cruz Alta', estado: 'RS', cultura_principal: 'Soja', area_hectares: 3600, faturamento_anual: 26100000, potencial_compra: 1305000, ultima_compra: '2025-03-25', status: 'ativo', produtos: { sementes: { nome: 'Sementes de Cobertura', quantidade: 540, valor_total: 432000 } } },
  { id: 'c032', nome: 'Agropecuária Tabuleiro Grande', cpf_cnpj: '42.567.890/0001-12', telefone: '(79) 3261-3300', email: 'tabuleiro@agro-se.com.br', cidade: 'Nossa Senhora da Glória', estado: 'SE', cultura_principal: 'Milho', area_hectares: 2800, faturamento_anual: 11200000, potencial_compra: 560000, ultima_compra: '2025-04-26', status: 'prospect', produtos: {} },
  { id: 'c033', nome: 'Hortaliças Top Quality', cpf_cnpj: '53.678.901/0001-23', telefone: '(61) 3461-4400', email: 'vendas@hortalicasdf.com.br', cidade: 'Planaltina', estado: 'DF', cultura_principal: 'Tomate', area_hectares: 180, faturamento_anual: 7200000, potencial_compra: 360000, ultima_compra: '2025-05-01', status: 'prospect', produtos: {} },
  { id: 'c034', nome: 'Agropecuária Bela Conquista', cpf_cnpj: '64.789.012/0001-34', telefone: '(77) 3421-8800', email: 'contato@belaconquista.com.br', cidade: 'Vitória da Conquista', estado: 'BA', cultura_principal: 'Café', area_hectares: 3800, faturamento_anual: 41200000, potencial_compra: 2060000, ultima_compra: '2025-04-21', status: 'ativo', produtos: { fertilizantes: { nome: 'Adubos NPK Café', quantidade: 150, valor_total: 1200000 } } },
  { id: 'c035', nome: 'Fazenda Nova Era Algodão', cpf_cnpj: '75.890.123/0001-45', telefone: '(62) 3451-3300', email: 'novaera@agrogo.com.br', cidade: 'Cristalina', estado: 'GO', cultura_principal: 'Algodão', area_hectares: 3400, faturamento_anual: 28900000, potencial_compra: 1445000, ultima_compra: '2025-04-14', status: 'ativo', produtos: { sementes: { nome: 'Sementes Algodão', quantidade: 420, valor_total: 756000 } } },
  { id: 'c036', nome: 'Agrícola Sul-Mato-Grossense', cpf_cnpj: '86.901.234/0001-56', telefone: '(67) 3431-7700', email: 'adm@agricosul.com.br', cidade: 'Dourados', estado: 'MS', cultura_principal: 'Soja', area_hectares: 7500, faturamento_anual: 54700000, potencial_compra: 2735000, ultima_compra: '2025-04-27', status: 'ativo', produtos: { sementes: { nome: 'Sementes Soja', quantidade: 1100, valor_total: 1980000 }, defensivos: { nome: 'Herbicidas', quantidade: 380, valor_total: 950000 } } },
  { id: 'c037', nome: 'Fazenda Palmeira do Norte', cpf_cnpj: '97.012.345/0001-67', telefone: '(63) 3521-2200', email: 'palmeira@agro-to.com.br', cidade: 'Palmas', estado: 'TO', cultura_principal: 'Pecuária de Corte', area_hectares: 28000, faturamento_anual: 42500000, potencial_compra: 2125000, ultima_compra: '2025-01-15', status: 'inativo', produtos: {} },
  { id: 'c038', nome: 'Café do Cerrado Mineiro Ltda', cpf_cnpj: '08.345.678/0001-78', telefone: '(34) 3841-5500', email: 'contato@cafecerrado.com.br', cidade: 'Patrocínio', estado: 'MG', cultura_principal: 'Café', area_hectares: 2100, faturamento_anual: 34500000, potencial_compra: 1725000, ultima_compra: '2025-04-30', status: 'ativo', produtos: { defensivos: { nome: 'Controle de Pragas', quantidade: 70, valor_total: 560000 }, fertilizantes: { nome: 'Adubos Cafeicultura', quantidade: 85, valor_total: 680000 } } },
  { id: 'c039', nome: 'Fazenda Canavial Centro-Oeste', cpf_cnpj: '19.456.789/0001-89', telefone: '(64) 3621-3300', email: 'canavial@agroco.com.br', cidade: 'Jataí', estado: 'GO', cultura_principal: 'Cana-de-Açúcar', area_hectares: 12500, faturamento_anual: 98000000, potencial_compra: 4900000, ultima_compra: '2025-04-22', status: 'ativo', produtos: { maquinario: { nome: 'Equipamentos Colheita', quantidade: 2, valor_total: 3200000 } } },
  { id: 'c040', nome: 'Agroveterinária Leite Bom', cpf_cnpj: '30.567.890/0001-90', telefone: '(44) 3531-4400', email: 'leitebom@agroparana.com.br', cidade: 'Toledo', estado: 'PR', cultura_principal: 'Pecuária Leiteira', area_hectares: 1100, faturamento_anual: 9500000, potencial_compra: 475000, ultima_compra: '2025-04-16', status: 'prospect', produtos: {} },
  { id: 'c041', nome: 'Fazenda Três Marias Agropecuária', cpf_cnpj: '41.678.901/0001-01', telefone: '(34) 3312-5500', email: 'financeiro@tresmariasagro.com.br', cidade: 'Araxá', estado: 'MG', cultura_principal: 'Milho', area_hectares: 5800, faturamento_anual: 26800000, potencial_compra: 1340000, ultima_compra: '2025-03-18', status: 'inativo', produtos: {} },
  { id: 'c042', nome: 'Agropecuária Serra Azul S/A', cpf_cnpj: '52.789.012/0001-12', telefone: '(69) 3461-2200', email: 'sac@serraazul.com.br', cidade: 'Vilhena', estado: 'RO', cultura_principal: 'Pecuária de Corte', area_hectares: 15000, faturamento_anual: 29500000, potencial_compra: 1475000, ultima_compra: '2025-04-11', status: 'prospect', produtos: {} },
  { id: 'c043', nome: 'Goiás Verde Hortifrúti', cpf_cnpj: '63.890.123/0001-23', telefone: '(62) 3261-7700', email: 'contato@goiasverde.com.br', cidade: 'Anápolis', estado: 'GO', cultura_principal: 'Tomate', area_hectares: 250, faturamento_anual: 5800000, potencial_compra: 290000, ultima_compra: '2025-04-28', status: 'prospect', produtos: {} },
  { id: 'c044', nome: 'Fazenda Esperança Cerrados', cpf_cnpj: '74.901.234/0001-34', telefone: '(99) 3241-3300', email: 'dir@esperancacerrados.com.br', cidade: 'Imperatriz', estado: 'MA', cultura_principal: 'Soja', area_hectares: 21000, faturamento_anual: 158000000, potencial_compra: 7900000, ultima_compra: '2025-04-29', status: 'ativo', produtos: { sementes: { nome: 'Sementes Soja', quantidade: 3200, valor_total: 5760000 }, defensivos: { nome: 'Defensivos', quantidade: 1100, valor_total: 2860000 } } },
  { id: 'c045', nome: 'Agrícola Nortão Agroindustrial', cpf_cnpj: '85.012.345/0001-45', telefone: '(66) 3521-6600', email: 'adm@nortaoagro.com.br', cidade: 'Lucas do Rio Verde', estado: 'MT', cultura_principal: 'Soja', area_hectares: 16000, faturamento_anual: 118000000, potencial_compra: 5900000, ultima_compra: '2025-04-25', status: 'ativo', produtos: { fertilizantes: { nome: 'Fertilizantes', quantidade: 800, valor_total: 2560000 }, sementes: { nome: 'Sementes Soja', quantidade: 2400, valor_total: 4320000 } } },
]

const swotMock = {
  strengths: [
    { id: 's1', text: 'Equipe técnica altamente qualificada e certificada' },
    { id: 's2', text: 'Relacionamento sólido e histórico com os principais fornecedores' },
    { id: 's3', text: 'Carteira diversificada de clientes em múltiplas culturas' },
    { id: 's4', text: 'Know-how em tecnologias de agricultura de precisão' },
    { id: 's5', text: 'Marca reconhecida e consolidada na região de atuação' },
    { id: 's6', text: 'Infraestrutura própria de armazenagem e distribuição' },
  ],
  weaknesses: [
    { id: 'w1', text: 'Alta dependência de poucos fornecedores estratégicos' },
    { id: 'w2', text: 'Baixa presença digital e canais de venda online limitados' },
    { id: 'w3', text: 'Processos comerciais majoritariamente manuais' },
    { id: 'w4', text: 'Limitação de crédito para expansão de linha de produtos' },
    { id: 'w5', text: 'Equipe comercial enxuta para cobertura de grandes territórios' },
  ],
  opportunities: [
    { id: 'o1', text: 'Expansão da fronteira agrícola no MATOPIBA' },
    { id: 'o2', text: 'Crescente adoção de tecnologias de agricultura de precisão' },
    { id: 'o3', text: 'Mercado de crédito de carbono em expansão acelerada' },
    { id: 'o4', text: 'Linhas de crédito subsidiado pelo Plano Safra 25/26' },
    { id: 'o5', text: 'Integração Lavoura-Pecuária-Floresta com incentivos fiscais' },
    { id: 'o6', text: 'Demanda crescente por bioinsumos e produtos orgânicos' },
  ],
  threats: [
    { id: 't1', text: 'Oscilação e queda nos preços das commodities agrícolas' },
    { id: 't2', text: 'Eventos climáticos extremos (secas e enchentes) cada vez mais frequentes' },
    { id: 't3', text: 'Aumento expressivo dos custos logísticos e fretes' },
    { id: 't4', text: 'Concorrência agressiva de multinacionais do setor' },
    { id: 't5', text: 'Inadimplência crescente no setor agropecuário' },
  ],
}

const gutMock = [
  { id: 'g1', problema: 'Inadimplência crescente na carteira de clientes', gravidade: 5, urgencia: 5, tendencia: 4, score: 100 },
  { id: 'g2', problema: 'Perda de clientes estratégicos para concorrentes', gravidade: 4, urgencia: 4, tendencia: 4, score: 64 },
  { id: 'g3', problema: 'Atrasos recorrentes nas entregas de insumos', gravidade: 4, urgencia: 5, tendencia: 3, score: 60 },
  { id: 'g4', problema: 'Falta de sistema de CRM integrado', gravidade: 3, urgencia: 3, tendencia: 5, score: 45 },
  { id: 'g5', problema: 'Equipe comercial sem treinamento técnico atualizado', gravidade: 3, urgencia: 4, tendencia: 3, score: 36 },
  { id: 'g6', problema: 'Baixa taxa de conversão de prospects em clientes', gravidade: 3, urgencia: 4, tendencia: 3, score: 36 },
  { id: 'g7', problema: 'Estoque desequilibrado de produtos sazonais', gravidade: 2, urgencia: 3, tendencia: 3, score: 18 },
  { id: 'g8', problema: 'Falta de acompanhamento pós-venda estruturado', gravidade: 2, urgencia: 2, tendencia: 4, score: 16 },
]

const pestMock = {
  political: [
    { id: 'p1', text: 'Plano Safra 2025/2026 com juros subsidiados e aumento de recursos' },
    { id: 'p2', text: 'Nova regulamentação de defensivos agrícolas em tramitação' },
    { id: 'p3', text: 'Política de seguro rural ampliada com subsídios governamentais' },
    { id: 'p4', text: 'Incentivos fiscais para produção de bioinsumos e orgânicos' },
  ],
  economic: [
    { id: 'e1', text: 'Alta do dólar favorecendo exportações do agronegócio' },
    { id: 'e2', text: 'Pressão inflacionária nos preços dos insumos agrícolas' },
    { id: 'e3', text: 'Crescimento do PIB agrícola acima da média nacional' },
    { id: 'e4', text: 'Aumento expressivo nos custos de frete e logística' },
    { id: 'e5', text: 'Taxa Selic elevada restringindo crédito para produtores' },
  ],
  social: [
    { id: 's1', text: 'Êxodo rural e escassez de mão de obra qualificada no campo' },
    { id: 's2', text: 'Demanda crescente por produtos sustentáveis e rastreáveis' },
    { id: 's3', text: 'Consumidores cada vez mais exigentes com certificações' },
    { id: 's4', text: 'Envelhecimento da população rural e falta de sucessão familiar' },
  ],
  technological: [
    { id: 't1', text: 'IA e machine learning aplicados à agricultura de precisão' },
    { id: 't2', text: 'Drones e VANTs para pulverização e mapeamento de lavouras' },
    { id: 't3', text: 'Sensores IoT para monitoramento remoto de culturas e solo' },
    { id: 't4', text: 'Plataformas digitais de marketplace agrícola em crescimento' },
    { id: 't5', text: 'Blockchain aplicado à rastreabilidade da cadeia produtiva' },
  ],
}

const metasMock = [
  { id: 'm1', nome: 'Faturamento Total Anual', tipo: 'financeiro', valorMeta: 1500000000, valorAtual: 1187000000, unidade: 'R$', responsavel: 'Diretoria Comercial', prazo: '2026-12-31', status: 'em_andamento' },
  { id: 'm2', nome: 'Novos Clientes Ativos', tipo: 'comercial', valorMeta: 60, valorAtual: 45, unidade: 'clientes', responsavel: 'Gerencia de Vendas', prazo: '2026-12-31', status: 'em_andamento' },
  { id: 'm3', nome: 'Reducao da Inadimplencia', tipo: 'financeiro', valorMeta: 5, valorAtual: 3.2, unidade: '%', responsavel: 'Financeiro', prazo: '2026-06-30', status: 'em_andamento' },
  { id: 'm4', nome: 'Conversao de Prospects', tipo: 'comercial', valorMeta: 40, valorAtual: 28, unidade: '%', responsavel: 'Marketing', prazo: '2026-09-30', status: 'em_andamento' },
  { id: 'm5', nome: 'Ticket Medio por Cliente', tipo: 'financeiro', valorMeta: 25000000, valorAtual: 22800000, unidade: 'R$', responsavel: 'Diretoria Comercial', prazo: '2026-12-31', status: 'em_andamento' },
  { id: 'm6', nome: 'Cobertura MATOPIBA', tipo: 'expansao', valorMeta: 8, valorAtual: 4, unidade: 'estados', responsavel: 'Expansao', prazo: '2026-12-31', status: 'em_andamento' },
  { id: 'm7', nome: 'Satisfacao dos Clientes (NPS)', tipo: 'qualidade', valorMeta: 75, valorAtual: 68, unidade: 'pontos', responsavel: 'CS', prazo: '2026-12-31', status: 'em_andamento' },
  { id: 'm8', nome: 'Lancamento de Bioinsumos', tipo: 'produto', valorMeta: 100, valorAtual: 30, unidade: '%', responsavel: 'P&D', prazo: '2026-06-30', status: 'atrasado' },
  { id: 'm9', nome: 'Migracao para Plataforma Digital', tipo: 'tecnologia', valorMeta: 100, valorAtual: 45, unidade: '%', responsavel: 'TI', prazo: '2026-10-31', status: 'em_andamento' },
  { id: 'm10', nome: 'Reducao de Custo Logistico', tipo: 'operacional', valorMeta: 15, valorAtual: 6, unidade: '%', responsavel: 'Operacoes', prazo: '2026-12-31', status: 'em_andamento' },
]

const campanhasMock = [
  { id: 'ca1', nome: 'Plano Safra 25/26 - Incentivo Soja', tipo: 'comercial', publico: 'Produtores de Soja', orcamento: 250000, retornoEstimado: 8500000, inicio: '2025-06-01', fim: '2025-12-31', status: 'planejada', canais: ['email', 'whatsapp', 'visita_tecnica'] },
  { id: 'ca2', nome: 'Dia de Campo - Agricultura de Precisao', tipo: 'evento', publico: 'Grandes Produtores', orcamento: 85000, retornoEstimado: 4200000, inicio: '2025-07-15', fim: '2025-07-16', status: 'planejada', canais: ['presencial', 'redes_sociais'] },
  { id: 'ca3', nome: 'Bioinsumos - Lancamento Regional', tipo: 'lancamento', publico: 'Produtores Organicos', orcamento: 120000, retornoEstimado: 3500000, inicio: '2025-08-01', fim: '2025-12-31', status: 'em_execucao', canais: ['email', 'whatsapp', 'redes_sociais', 'visita_tecnica'] },
  { id: 'ca4', nome: 'Recuperacao de Clientes Inativos', tipo: 'retencao', publico: 'Clientes Inativos', orcamento: 45000, retornoEstimado: 1800000, inicio: '2025-05-01', fim: '2025-09-30', status: 'em_execucao', canais: ['telefone', 'whatsapp', 'email'] },
  { id: 'ca5', nome: 'Black Friday Agro - Descontos Insumos', tipo: 'promocao', publico: 'Todos os Clientes', orcamento: 180000, retornoEstimado: 6500000, inicio: '2025-11-20', fim: '2025-11-30', status: 'planejada', canais: ['email', 'whatsapp', 'redes_sociais'] },
  { id: 'ca6', nome: 'Feira Agronegocio MATOPIBA', tipo: 'feira', publico: 'Produtores MATOPIBA', orcamento: 95000, retornoEstimado: 5200000, inicio: '2025-05-20', fim: '2025-05-23', status: 'concluida', canais: ['presencial'] },
  { id: 'ca7', nome: 'Programa Fidelidade Safra Alta', tipo: 'fidelizacao', publico: 'Clientes Classe A', orcamento: 300000, retornoEstimado: 12000000, inicio: '2025-07-01', fim: '2026-06-30', status: 'planejada', canais: ['visita_tecnica', 'email', 'whatsapp'] },
  { id: 'ca8', nome: 'Workshop Manejo Integrado de Pragas', tipo: 'educacional', publico: 'Engenheiros Agronomos', orcamento: 35000, retornoEstimado: 1800000, inicio: '2025-06-10', fim: '2025-06-12', status: 'concluida', canais: ['presencial', 'redes_sociais'] },
]

const pipelineMock = {
  prospeccao: [
    { id: 'p1', cliente: 'Fazenda Bela Vista Agroflorestal', cultura: 'Pecuaria Leiteira', cidade: 'Ji-Parana/RO', valor: 490000, probabilidade: 20, contato: 'Joao Silva', ultimoContato: '2026-04-28', observacao: 'Demonstrou interesse em suplementacao mineral' },
    { id: 'p2', cliente: 'Floresta Verde Reflorestamento', cultura: 'Eucalipto', cidade: 'Gurupi/TO', valor: 1120000, probabilidade: 15, contato: 'Maria Oliveira', ultimoContato: '2026-04-25', observacao: 'Aguardando retorno sobre fertilizantes especiais' },
    { id: 'p5', cliente: 'Hortifruti Organico Chapada', cultura: 'Fruticultura', cidade: 'Lencois/BA', valor: 215000, probabilidade: 30, contato: 'Pedro Costa', ultimoContato: '2026-04-30', observacao: 'Primeiro contato - interesse em defensivos organicos' },
    { id: 'p9', cliente: 'Agropecuaria Serra Azul S/A', cultura: 'Pecuaria de Corte', cidade: 'Vilhena/RO', valor: 1475000, probabilidade: 25, contato: 'Ana Souza', ultimoContato: '2026-04-22', observacao: 'Solicitou proposta de medicamentos veterinarios' },
  ],
  qualificacao: [
    { id: 'p3', cliente: 'Agropecuaria Tabuleiro Grande', cultura: 'Milho', cidade: 'N. Sra da Gloria/SE', valor: 560000, probabilidade: 45, contato: 'Carlos Lima', ultimoContato: '2026-04-26', observacao: 'Proposta de sementes de milho enviada. Aguarda resposta.' },
    { id: 'p6', cliente: 'Agricula Piaui Cerrado', cultura: 'Algodao', cidade: 'Urucui/PI', valor: 2725000, probabilidade: 50, contato: 'Fernanda Alves', ultimoContato: '2026-04-29', observacao: 'Visita tecnica agendada para maio. Orcamento em elaboracao.' },
    { id: 'p10', cliente: 'Hortalicas Top Quality', cultura: 'Tomate', cidade: 'Planaltina/DF', valor: 360000, probabilidade: 40, contato: 'Ricardo Neves', ultimoContato: '2026-05-01', observacao: 'Perfil cadastrado. Analise de credito em andamento.' },
  ],
  proposta: [
    { id: 'p4', cliente: 'Cerealistas Trigo & Cia', cultura: 'Trigo', cidade: 'Passo Fundo/RS', valor: 715000, probabilidade: 65, contato: 'Juliana Martins', ultimoContato: '2026-04-27', observacao: 'Proposta formal enviada. Valor R$ 715.000 em sementes de trigo.' },
    { id: 'p7', cliente: 'Agroveterinaria Leite Bom', cultura: 'Pecuaria Leiteira', cidade: 'Toledo/PR', valor: 475000, probabilidade: 70, contato: 'Marcos Teixeira', ultimoContato: '2026-04-30', observacao: 'Negociando prazo de pagamento. Proposta ajustada em 28/04.' },
    { id: 'p11', cliente: 'Goias Verde Hortifruti', cultura: 'Tomate', cidade: 'Anapolis/GO', valor: 290000, probabilidade: 60, contato: 'Sandra Campos', ultimoContato: '2026-04-28', observacao: 'Proposta de defensivos enviada. Aguarda aprovacao do conselho.' },
  ],
  negociacao: [
    { id: 'p8', cliente: 'Fruticultura Serrana Organicos', cultura: 'Fruticultura', cidade: 'Vacaria/RS', valor: 330000, probabilidade: 85, contato: 'Lucas Ferreira', ultimoContato: '2026-05-01', observacao: 'Fechando detalhes contratuais. Pedido de 220 ton de fertilizante organico.' },
    { id: 'p12', cliente: 'Agropecuaria Boa Vista Ltda', cultura: 'Soja', cidade: 'Sorriso/MT', valor: 4250000, probabilidade: 90, contato: 'Roberto Almeida', ultimoContato: '2026-05-01', observacao: 'Renovacao de contrato. Acrescimo de 20% no volume. Fechamento previsto para 05/05.' },
  ],
  fechado_ganho: [
    { id: 'p13', cliente: 'Cafe Mantiqueira Exportacao', cultura: 'Cafe', cidade: 'Varginha/MG', valor: 1520000, probabilidade: 100, contato: 'Paulo Henrique', ultimoContato: '2026-04-15', observacao: 'Contrato assinado. Adubos especiais para safra 2026.' },
    { id: 'p14', cliente: 'Palma Oleos Vegetais S/A', cultura: 'Dende', cidade: 'Tailandia/PA', valor: 930000, probabilidade: 100, contato: 'Camila Rocha', ultimoContato: '2026-04-10', observacao: 'Fechado! Adubacao de palma - 310 toneladas.' },
  ],
  fechado_perdido: [
    { id: 'p15', cliente: 'Arrozeira Gaucha Exportacao', cultura: 'Arroz', cidade: 'Pelotas/RS', valor: 640000, probabilidade: 100, contato: 'Gustavo Vargas', ultimoContato: '2026-03-20', observacao: 'Optou por concorrente com preco 8% menor.' },
  ],
}

const relatoriosMock = [
  { id: 'r1', titulo: 'Carteira Completa de Clientes', tipo: 'analitico', descricao: 'Lista completa com todos os clientes, contatos, culturas e valores', icone: 'users', geradoEm: null },
  { id: 'r2', titulo: 'Analise ABC de Faturamento', tipo: 'analitico', descricao: 'Classificacao ABC dos clientes com graficos de faturamento acumulado', icone: 'bar-chart', geradoEm: null },
  { id: 'r3', titulo: 'Penetracao por Estado e Cultura', tipo: 'analitico', descricao: 'Analise geografica da carteira com distribuicao por estado e cultura', icone: 'map', geradoEm: null },
  { id: 'r4', titulo: 'Relatorio de Prospects', tipo: 'comercial', descricao: 'Prospects ativos com potencial de compra, contatos e observacoes', icone: 'target', geradoEm: null },
  { id: 'r5', titulo: 'Metas e Indicadores', tipo: 'gerencial', descricao: 'Acompanhamento de metas, KPIs e progresso das acoes estrategicas', icone: 'trending-up', geradoEm: null },
  { id: 'r6', titulo: 'Pipeline de Vendas', tipo: 'comercial', descricao: 'Oportunidades por estagio do pipeline com valores e probabilidades', icone: 'git-branch', geradoEm: null },
  { id: 'r7', titulo: 'Matriz SWOT', tipo: 'estrategico', descricao: 'Forcas, fraquezas, oportunidades e ameacas da operacao', icone: 'grid', geradoEm: null },
  { id: 'r8', titulo: 'Matriz GUT - Priorizacao', tipo: 'estrategico', descricao: 'Problemas priorizados por gravidade, urgencia e tendencia', icone: 'star', geradoEm: null },
  { id: 'r9', titulo: 'Analise PEST', tipo: 'estrategico', descricao: 'Fatores politicos, economicos, sociais e tecnologicos do ambiente externo', icone: 'globe', geradoEm: null },
  { id: 'r10', titulo: 'Resumo Executivo', tipo: 'gerencial', descricao: 'Visao consolidada de KPIs, graficos e principais insights da carteira', icone: 'file-text', geradoEm: null },
]

const SEED_VERSION = 'v1'

export function seedData(): void {
  const seeded = localStorage.getItem('insightpro_seed_version')
  if (seeded === SEED_VERSION) return

  localStorage.setItem('insightpro_data', JSON.stringify(clientesMock))
  localStorage.setItem('insightpro_swot', JSON.stringify(swotMock))
  localStorage.setItem('insightpro_gut', JSON.stringify(gutMock))
  localStorage.setItem('insightpro_pest', JSON.stringify(pestMock))
  localStorage.setItem('insightpro_metas', JSON.stringify(metasMock))
  localStorage.setItem('insightpro_campanhas', JSON.stringify(campanhasMock))
  localStorage.setItem('insightpro_pipeline', JSON.stringify(pipelineMock))
  localStorage.setItem('insightpro_relatorios', JSON.stringify(relatoriosMock))
  localStorage.setItem('insightpro_seed_version', SEED_VERSION)
}

# Tactical Strike — Vila do Chaves + MP3 pessoais

## Rodar no computador
1. Instale o Node.js (versão 18 ou superior).
2. Abra um terminal na pasta deste projeto.
3. Execute `npm install` (requer internet na primeira instalação).
4. Execute `npm start`.
5. Abra http://localhost:3000 e aguarde o mapa carregar.
6. Clique em **TREINO COM BOTS** ou **SALA ONLINE**.

Three.js é servido pelo próprio projeto, sem dependência de CDN durante a partida.
Não abra o HTML diretamente: use o servidor acima.

## Escolher suas músicas
No menu, em **Suas músicas (MP3)**, selecione um ou vários arquivos do computador.
A seleção substitui a lista anterior. Use a lista para escolher uma faixa ou os botões
Anterior/Próxima. A lista repete automaticamente quando termina.

Os MP3 ficam apenas na aba do navegador: não são enviados ao servidor ou aos outros
jogadores. A música continua ao entrar e sair da partida. Os controles de volume e
liga/desliga aparecem também no HUD. Aperte Esc para usar os botões durante o jogo.
Ao atualizar/fechar a página, selecione os arquivos novamente. **Limpar** libera a lista.
Arquivos inválidos mostram uma mensagem e permitem escolher outra faixa.
Nenhuma música comercial está incluída no projeto.

## Mapa enviado: de_chaves3.0
Geometria, texturas embutidas, iluminação aproximada e 32 pontos de nascimento foram
convertidos do BSP enviado. O mapa está em `public/maps/chaves/` e abre por padrão.
Crédito do mapa original, extraído de sua descrição: **Raul Cotrim de Mattos**, agosto de 2010,
CounterZone.com.br. Os créditos não representam uma nova licença do mapa.

A adaptação inclui colisão com o cenário, gravidade, degraus e pulo. Paredes bloqueiam
os tiros do jogador e os ataques dos bots. Não é uma execução da engine GoldSrc:
- Portas exportadas abertas e fixas.
- Objetos quebráveis ficam estáticos; água não possui natação/efeitos originais.
- Gatilhos, explosões e objetivo de bomba do mapa original não foram implementados.
- O RAR não contém as seis imagens do céu citadas no .res; há um céu simples de substituição.
- A iluminação é aproximada por vértices. Decalques da engine não foram importados.
- Bots usam movimentação simples, sem navegação avançada entre os cômodos.

## Controles
WASD: mover · Mouse: mirar · Clique: atirar · Shift: correr · Espaço: pular
R: recarregar · Esc: liberar cursor · MENU: voltar ao menu

## Multiplayer básico
Deixe o endereço vazio para usar o próprio servidor ou informe a URL do servidor
Node.js de seus amigos. Hospedagem deve aceitar Node.js e WebSockets. A variável
`PORT` configura a porta. Os clientes devem usar esta mesma versão e o mesmo mapa.

Posição (incluindo altura) e rotação são compartilhadas. Vida, dano, bots, munição e
placar ainda são locais: não há combate PvP sincronizado nem servidor autoritativo.

## Estrutura
- `server.js`: Express + Socket.IO.
- `public/index.html`: jogo, carregamento do mapa e seleção de músicas.
- `public/maps/chaves/`: mapa convertido e texturas PNG.
- `tools/convert_map.py`: conversor usado (Python + Pillow), para reprodução técnica.

Conversor: `python tools/convert_map.py caminho/de_chaves3.bsp public/maps/chaves`
Referência de formato: https://github.com/ValveSoftware/halflife/blob/master/utils/common/bspfile.h

## Verificações desta versão
Validado em navegador Chromium: carregar mapa, iniciar treino, reproduzir MP3 local,
trocar faixa, pausar/retomar, limpar a lista e conectar/desconectar dois clientes.
Os 32 pontos de nascimento passaram no teste de colisão com o chão.
Para repetir o teste do mapa: `npm run test:map`.

## Personagens humanos low poly
Quatro operadores originais: Sentinela, Vanguarda, Nômade e Sombra.
Modelos procedurais com 1.056 a 1.252 triângulos por personagem,
rostos humanos, uniformes, coletes, equipamentos e rifles.
Pernas articuladas com animação de caminhada. Geometrias e materiais compartilhados.
Os bots alternam entre os quatro modelos; jogadores online recebem um modelo
consistente durante a conexão. Não há seletor de personagem nesta versão.
Galeria: abra http://localhost:3000/personagens.html ou clique em Conhecer os quatro operadores.
Código reutilizável: public/characters.js, funções createOperator e animateOperator.
Modelos nativos de Three.js; não são arquivos FBX/GLB.
Validação: quatro modelos renderizados na galeria e início de treino sem erros JavaScript.

const express   = require('express');
const puppeteer = require('puppeteer');

const server = express();

server.get('/', async (request, response) => {
    const browser  = await puppeteer.launch();
    const mainPage = await browser.newPage();
    let sidePage   = await browser.newPage();
    await mainPage.goto('https://standings.stalruth.dev/2024/worlds/masters');

/**
 * passos:
 * 1- (loop) percorrer linha por linha da tabela de id='standings-body'
 * 2- pegar o nome do jogador e separar em nome e país
 * 3- (extra) associar o link no nome a sidePage
 * 4- (extra) em side page, buscaras tabelas por quais restritos ele enfrentou e se venceu ou perdeu
 * 5-  copiar os set de cada mon do time
 * 6- identificar qual dos 6 é o restrito, se houver
 * 7- copiar o record
 **/
    const data = await mainPage.evaluate( () => {
        const rows = document.querySelectorAll('#standings-body tr');
        const playersData = [];
        rows.forEach( (row) => {
            // filter logic here
            const name_country = row.querySelector('.name-cell a').textContent.trim();

            const _paste       = row.querySelector('.name-team .team a').href;
            //const pastePage    = browser.newPage();
            //sidePage.goto(_paste);
            //const tera_types   = await pastePage.evaluate(() => {
            //    let teras = [];
            //    const mons_articles = document.querySelectorAll('article');
            //    mons_articles.forEach((mon_article) => {
            //        teras.push(mon_article.querySelectorAll('prep span')[3].textContent.trim());
            //    });
            //    return teras;
            //});
            //pastePage.close();

            //const playerPage   = await browser.newPage();
            //await playerPage.goto(row.querySelector('.name-team .name a').href);
            // descobrir de quais restritos o cara perdeu e venceu
            //let _matchups = [];
            //playerPage.close();

            const team_section = row.querySelectorAll('.name-team .team a span');
            const team_members = [team_section[0].title, team_section[1].title, team_section[2].title, 
                                  team_section[3].title, team_section[4].title, team_section[5].title]
            let restrict_mon = "";

            // checking the retrict Pokémon (some players used just Calyrex)
            for(let i=0; i<6; i++){
                let pokemon = team_members[i];
                if (pokemon == 'Miraidon'  || pokemon == 'Calyrex-Ice' || pokemon == 'Calyrex-Shadow' || 
                    pokemon == 'Zamazenta' || pokemon == 'Zacian'      || pokemon == 'Terapagos'      || 
                    pokemon == 'Koraidon'  || pokemon == 'Kyogre'      || pokemon == 'Groudon'        ||
                    pokemon == 'Lunala'    || pokemon == 'Rayquaza'    || pokemon == 'Calyrex'        ||
                    pokemon == 'Necrozma-Dawn-Wings'){
                        restrict_mon = pokemon;
                };
            };

            const playerInfo = {
                name: name_country.slice(0, -5),
                country: name_country.slice(-4),
                slot1: team_members[0],
                //tera1: tera_types[0],
                slot2: team_members[1],
                //tera2: tera_types[1],
                slot3: team_members[2],
                //tera3: tera_types[2],
                slot4: team_members[3],
                //tera4: tera_types[3],
                slot5: team_members[4],
                //tera5: tera_types[4],
                slot6: team_members[5],
                //tera6: tera_types[5],
                restrict: restrict_mon,
                paste: _paste,
                //matchups: true,
                result: row.querySelector('.record-resistance .record').textContent.trim(),
            };
            playersData.push(playerInfo);
        });
        return playersData;
    });
    response.send(data);
    await browser.close();
});


server.listen(3000, () => {
    console.log("server running on PORT 3000!");
});
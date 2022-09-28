// import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import axios from "axios";
import * as fs from 'fs';
import { apiEndpoint, apiKey, clubLeagues, internationalLeagues } from "./constants";

(async () => {
  // // get raw data, players of all teams of all leagues
  // clubLeagues.forEach(async league => {
  //   const teamsRes = await axios(
  //     apiEndpoint + 'teams',
  //     {
  //       headers: {
  //         'x-apisports-key': apiKey,
  //       },
  //       params: {
  //         'league': league,
  //         'season': 2022,
  //       },
  //     },
  //   );

  //   fs.writeFileSync(`raw/league-2022-${league}-teams.json`, JSON.stringify(teamsRes.data.response));

  //   for (let i = 0; i < teamsRes.data.response.length; i++) {
  //     const teamId = teamsRes.data.response[i].team.id;

  //     let page = 1;
  //     let players: any[] = [];
  //     while (page < 6) { // there should not be more than 5 pages for players. this is a safe check in case code goes rogue
  //       const params = page == 1
  //         ? {
  //           'league': league,
  //           'season': 2022,
  //           'team': teamId,
  //         }
  //         : {
  //           'league': league,
  //           'season': 2022,
  //           'team': teamId,
  //           'page': page,
  //         };
  //       const playersRes = await axios(
  //         apiEndpoint + 'players',
  //         {
  //           headers: {
  //             'x-apisports-key': apiKey,
  //           },
  //           params: params,
  //         },
  //       );

  //       players = players.concat(playersRes.data.response);


  //       if (!playersRes.data || !playersRes.data.paging || !playersRes.data.paging.total || playersRes.data.paging.total === page) {
  //         break;
  //       }

  //       page++;
  //     }

  //     fs.writeFileSync(`raw/team-2022-${teamId}-players.json`, JSON.stringify(players));

  //     console.log('team', teamId);
  //   }
  // });

  // // process teams and players
  // clubLeagues.forEach(league => {
  //   const rawTeams = JSON.parse(fs.readFileSync(`raw/league-2022-${league}-teams.json`, 'utf-8'));
  //   const processedTeams: { id: any; name: any; logo: any; }[] = [];
  //   rawTeams.forEach((team: { team: { id: any; name: any; logo: any; }; }) => {
  //     processedTeams.push({
  //       id: team.team.id,
  //       name: team.team.name,
  //       logo: team.team.logo,
  //     });

  //     const rawPlayers = JSON.parse(fs.readFileSync(`raw/team-2022-${team.team.id}-players.json`, 'utf-8'));
  //     const processedPlayers: { team: any, id: any; name: any; photo: any; games: never[]; }[] = [];
  //     rawPlayers.forEach((player: { player: { id: any; name: any; photo: any; }; }) => {
  //       processedPlayers.push({
  //         team: team.team.id,
  //         id: player.player.id,
  //         name: player.player.name,
  //         photo: player.player.photo,
  //         games: [],
  //       });
  //     })

  //     processedPlayers.sort((a, b) => a.name > b.name ? 1 : -1);
  //     fs.writeFileSync(`processed/team-2022-${team.team.id}-players.json`, JSON.stringify(processedPlayers));
  //   });

  //   processedTeams.sort((a, b) => a.name > b.name ? 1 : -1);
  //   fs.writeFileSync(`processed/league-2022-${league}-teams.json`, JSON.stringify(processedTeams));
  // })


  // load processed players and union
  const players = new Map<Number, { id: number, name: string, photo: string, games: { minutes: number, teams: { name: string, logo: string }[] }[] }>();
  for (let i = 0; i < clubLeagues.length; i++) {
    const league = clubLeagues[i];
    const teams = JSON.parse(fs.readFileSync(`processed/league-2022-${league}-teams.json`, 'utf-8'));
    teams.forEach((team: { id: any; }) => {
      const teamPlayers = JSON.parse(fs.readFileSync(`processed/team-2022-${team.id}-players.json`, 'utf-8'));
      teamPlayers.forEach((player: { id: number, name: string, photo: string, games: { minutes: number, teams: { name: string, logo: string }[] }[] }) => {
        players.set(player.id, player);
      });
    });
  };

  fs.writeFileSync('processed/players-2022.json', JSON.stringify(Array.from(players.values())));


  // get fixtures and update players game info
  for (let i = 0; i < internationalLeagues.length; i++) {
    const league = internationalLeagues[i];
    const fixturesRes = await axios(
      apiEndpoint + 'fixtures',
      {
        headers: {
          'x-apisports-key': apiKey,
        },
        params: {
          'league': league,
          'season': 2022,
          'from': '2022-09-19',
          'to': '2022-09-30',
        },
      },
    );

    fs.writeFileSync(`raw/fixtures-2022-20220919-20220930-${league}.json`, JSON.stringify(fixturesRes.data.response));

    // Maximum of 20 ids allowed
    const fixturesInChunk = []
    while (fixturesRes.data.response.length) {
      fixturesInChunk.push(fixturesRes.data.response.splice(0, 20).map((f: { fixture: { id: any; }; }) => f.fixture.id));
    }
    const idsArray = fixturesInChunk.map(f => f.join('-'));
    let fixtures_ids: any[] = []
    for (let j = 0; j < idsArray.length; j++) {
      const res = await axios(
        apiEndpoint + "fixtures",
        {
          headers: {
            'x-apisports-key': apiKey,
          },
          params: {
            'ids': idsArray[j],
          },
        },
      );

      fixtures_ids = fixtures_ids.concat(res.data.response);

      fs.writeFileSync(`raw/fixtures-ids-2022-20220919-20220930-${league}-${j}.json`, JSON.stringify(res.data.response));
    }

    fs.writeFileSync(`processed/fixtures-ids-2022-${league}.json`, JSON.stringify(fixtures_ids));

    for (let i = 0; i < fixtures_ids.length; i++) {
      const fixture = fixtures_ids[i];
      if (fixture.events.length) {
        const teams = [
          {
            name: fixture.teams.home.name,
            logo: fixture.teams.home.logo,
          },
          {
            name: fixture.teams.away.name,
            logo: fixture.teams.away.logo,
          },
        ];
        const elapsed: number = fixture.fixture.status.elapsed;
        fixture.lineups.forEach((team: { startXI: any[]; }) => {
          if (team.startXI) {
            team.startXI.forEach(player => {
              if (players.get(player.player.id)) {
                players.get(player.player.id)!.games.push({
                  minutes: elapsed,
                  teams,
                });

                for (let j = 0; j < fixture.events.length; j++) {
                  const event = fixture.events[j];
                  if (event.type === "subst") {
                    if (event.player.id == player.player.id) {
                      players.get(player.player.id)!.games[players.get(player.player.id)!.games.length - 1].minutes = event.time.elapsed;

                      if (players.get(event.assist.id)) {
                        players.get(event.assist.id)!.games.push({
                          minutes: elapsed - event.time.elapsed,
                          teams,
                        });
                      }
                    } else if (event.assist.id == player.player.id) {
                      players.get(event.assist.id)!.games[players.get(event.assist.id)!.games.length - 1].minutes = event.time.elapsed;

                      if (players.get(event.player.id)) {
                        players.get(event.player.id)!.games.push({
                          minutes: elapsed - event.time.elapsed,
                          teams,
                        });
                      }
                    }
                  }
                }
              }
            })
          } else {
            // console.log(fixture.fixture.id);
          }
        })
      }
    }
  };

  fs.writeFileSync("processed/playsGameInfo.json", JSON.stringify(Array.from(players.values())));
})();

// (async () => {
//   const teamsRes = await axios(
//     apiEndpoint + 'players',
//     {
//       headers: {
//         'x-apisports-key': apiKey,
//       },
//       params: {
//         'league': 135,
//         'season': 2022,
//         'team': 505,
//       },
//     },
//   );
//   console.log(teamsRes.data.response);
// })();
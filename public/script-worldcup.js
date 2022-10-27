const firebaseConfig = {
  apiKey: "AIzaSyAZZ6vSlPHp0JvL8FEzb8NfLr1XLUviXro",
  authDomain: "didtheyplay-prod.firebaseapp.com",
  projectId: "didtheyplay-prod",
  storageBucket: "didtheyplay-prod.appspot.com",
  messagingSenderId: "153982345516",
  appId: "1:153982345516:web:b8d12399d87dd2d3ca8c89",
  measurementId: "G-FQVFDTLV23"
};
firebase.initializeApp(firebaseConfig);

const league_team_mapping = {
  "Premier League": [
    "Arsenal",
    "Chelsea",
    "Liverpool",
    "Tottenham Hotspur",
    "Man City",
    "Man United",
  ],
  "La Liga": [
    "Atletico Madrid",
    "Barcelona",
    "Real Madrid",
  ],
  "Serie A": [
    "AC Milan",
    "Inter Milan",
    "Juventus",
    "Roma",
  ],
  "Bundesliga": [
    "Bayern Munich",
  ],
  "League 1": [
    "Paris Saint-Germain",
  ],
};

$(function () {
  $('#leagues button').click((e) => {
    e.preventDefault();
    $(e.currentTarget).parent().find('button').removeClass('active');
    $(e.currentTarget).addClass('active');

    const league = $(e.currentTarget).text().trim();

    $('#teams').empty();
    const teams = league_team_mapping[$(e.currentTarget).text().trim()];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i]

      const teamElement = $('<button>');
      teamElement.addClass('list-group-item list-group-item-action');
      if (i === 0) {
        teamElement.addClass('active');
      }
      teamElement.attr('type', 'button');
      teamElement.text(team);
      teamElement.click((e) => {
        e.preventDefault();
        $(e.currentTarget).parent().find('button').removeClass('active');
        $(e.currentTarget).addClass('active');

        $('#goalkeepers').empty();
        $('#defenders').empty();
        $('#midfielders').empty();
        $('#forwards').empty();
        firebase.firestore().collection(`leagues/${league}/teams/${team}/players`).get().then((snapshot) => {
          snapshot.docs.forEach((doc) => {
            const player = doc.data();
            const playerElement = $('<button>');
            playerElement.addClass('list-group-item list-group-item-action');
            playerElement.attr('type', 'button');

            const playerDivElement = $('<div>');
            playerDivElement.addClass('row');

            const numberSpanElement = $('<span>');
            numberSpanElement.addClass('col-2');
            numberSpanElement.text(player.number);

            const nameSpanElement = $('<span>');
            nameSpanElement.addClass('col-6');
            nameSpanElement.text(player.name);

            const nationalitySpanElement = $('<span>');
            nationalitySpanElement.addClass('col');
            nationalitySpanElement.text(player.nationality);

            playerDivElement.append(numberSpanElement);
            playerDivElement.append(nameSpanElement);
            playerDivElement.append(nationalitySpanElement);

            playerElement.click((e) => {
              e.preventDefault();
              $(e.currentTarget).parent().find('button').removeClass('active');
              $(e.currentTarget).addClass('active');

              $('#games').empty();

              firebase.firestore().collection('world_cup_games').where('teams', 'array-contains-any', [player.nationality]).get().then((snapshot) => {
                snapshot.docs.forEach((doc) => {
                  const game = doc.data();
                  const gameElement = $('<li>');
                  gameElement.addClass('list-group-item');

                  const gameDivElement = $('<div>');
                  gameDivElement.addClass('row');

                  const teamsSpanElement = $('<span>');
                  teamsSpanElement.addClass('col-6');
                  // TODO: home, away
                  teamsSpanElement.text(`${game.Home} vs ${game.Away}`);

                  const timeSpanElement = $('<span>');
                  timeSpanElement.addClass('col');
                  // TODO: time
                  timeSpanElement.text(game.Time.toDate().toLocaleString());

                  gameDivElement.append(teamsSpanElement);
                  gameDivElement.append(timeSpanElement);

                  gameElement.append(gameDivElement);

                  $('#games').append(gameElement);
                });
              });
            });

            playerElement.append(playerDivElement);

            if (player.position === 'Goalkeeper') {
              $('#goalkeepers').append(playerElement);
            } else if (player.position === 'Defender') {
              $('#defenders').append(playerElement);
            } else if (player.position === 'Midfielder') {
              $('#midfielders').append(playerElement);
            } else if (player.position === 'Forward') {
              $('#forwards').append(playerElement);
            }

            // $('#goalkeepers button')[0].click();
          });
        });
      });
      $('#teams').append(teamElement);
    }

    $('#teams button')[0].click();
  });

  $('#leagues button')[0].click();
})
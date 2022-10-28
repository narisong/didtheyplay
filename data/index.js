import * as fs from 'fs';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import admin from 'firebase-admin';

const leagueName = 'Premier League'
const teamName = 'Arsenal'

const rawTeam = JSON.parse(fs.readFileSync(`${teamName}.json`, 'utf-8'));

console.log(rawTeam);

initializeApp({
  credential: applicationDefault(),
  databaseURL: 'https://didtheyplay-prod.firebaseio.com'
});

rawTeam.forEach(player => {
  admin.firestore().doc(`leagues/${leagueName}/teams/${teamName}/players/${player.name}`).set(player);
});

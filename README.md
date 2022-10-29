# Write to firebase cloud firestore

## Setup

1. Source code is in `data` dir
1. Firebase private key is saved in `keys` dir
1. Run `export GOOGLE_APPLICATION_CREDENTIALS="/Users/risongna/projects/didtheyplay/keys/didtheyplay-prod-firebase-adminsdk-6ymq3-02f12eefa2.json"`

## Get raw data

1. Copy team squad from ESPN to google spreadsheet
1. Refer to `Arsenal`, remove useless columns
1. Copy and paste to a new file, e.g. `ManUnited`
1. Run `python3 process.py`
1. Run `node index.js`
1. Check firebase cloud firestore

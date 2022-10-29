import json
import re

positions = {
    "G": "Goalkeeper",
    "D": "Defender",
    "M": "Midfielder",
    "F": "Forward",
}

nationalities = {
    "United States": "USA",
}

result = []

teamName = 'Paris Saint Germain'

with open(teamName) as file:
    lines = [line.rstrip() for line in file]
    for l in lines:
        splits = re.split('(\d+)', l)
        name = splits[0]
        number = splits[1]
        position = splits[2].split()[0]
        nationality = ' '.join(splits[2].split()[1:])
        player = {
            "name": name,
            "number": int(number),
            "nationality": nationalities[nationality] if nationality in nationalities else nationality,
            "position": positions[position],
        }
        result.append(player)

with open('%s.json' % teamName, 'w') as f:
    json.dump(result, f)

import re
import sys
import os
PROGRAM_NAME = 0
INPUT_FILENAME = 1
EXPECTED_ARG_NUM = 2

# check arg num
if (len(sys.argv)!=EXPECTED_ARG_NUM):
    sys.exit(f"Usage: {sys.argv[PROGRAM_NAME]} filename")

# check if file exists
filename = sys.argv[INPUT_FILENAME]
if not os.path.exists(filename):
    sys.exit(f"Error: File '{sys.argv[INPUT_FILENAME]}' not found")

class player_record:
    """
    Holds player records, including name, total bats and total hits.
    Functions:
        update(bats, hits): adds bats to total_bats and hits to total_hits
        calc_batting_avg(): calculates and returns total_hits/total_bats
    """

    def __init__(self, name):
        """
        Sets total_bats and total_hits to 0
        """
        self.name = name
        self.total_bats = 0
        self.total_hits = 0
    
    def update(self, bats, hits):
        """
        Adds bats to total_bats and hits to total_hits.
        Returns void.
        """
        self.total_bats += bats
        self.total_hits += hits
    def calc_batting_avg(self):
        """
        Calculates and returns total_hits/total_bats.
        """
        return self.total_hits/self.total_bats
# matchs "XXX XXX batted # times with # hits and # runs"
record_regex = re.compile(r"(?P<name>.+) batted (?P<bats>\d+) times with (?P<hits>\d+) hits and \d+ runs")

# read file
with open(filename) as f:
    records = f.read()
all_matches = record_regex.findall(records)

# compute the total bats and hits for each player
all_names = set(name for name, _, _ in all_matches)
all_players = {name: player_record(name) for name in all_names}
for name, bats, hits in all_matches:
    all_players[name].update(int(bats), int(hits))

# sort by batting average and print
all_players_list = [record for _, record in all_players.items()]
all_players_list.sort(key=lambda x: x.calc_batting_avg(),reverse=True)
for record in all_players_list:
    print(f"{record.name}: {record.calc_batting_avg():.3f}")

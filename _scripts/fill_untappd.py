

import os
import pytz
import time
import json
import sqlite3
import requests
import calendar
from dateutil import parser as dateparser

requests.packages.urllib3.disable_warnings()

db_file = os.path.join(os.getcwd(), 'untappd.db')
conn = sqlite3.connect(db_file)
c = conn.cursor()

create = """
create table if not exists checkins (
    cid INTEGER PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    beer VARCHAR NOT NULL,
    venue VARCHAR NOT NULL,
    json VARCHAR NOT NULL
)"""

c.execute(create)

api_id     = 'E8847D1FA347C37248DEC90E1D21568E18FC5152'
api_secret = '199C86117D183A9B6BCB3220098F34CFF81FD562'
brewery_checkin_url = 'https://api.untappd.com/v4/brewery/checkins/451812'

UTC = pytz.utc
EST = pytz.timezone('America/New_York')

url = brewery_checkin_url
params = {
    'client_id'     : api_id,
    'client_secret' : api_secret,
    'limit'         : 100,
}

def fillforward():
    c.execute('select max(cid) from checkins')
    row = c.fetchone()
    if row and row[0]:
        params['min_id'] = row[0]
    else:
        params['min_id'] = 0
    # if 'min_id' in params:
    #     del params['min_id']
    # params["min_id"] = 0

    while True:
        print(params)
        r = requests.get(url, params=params)
        r.raise_for_status()
        response = r.json()['response']
        checkins = response['checkins']
        max_id = None
        print(checkins)
        for checkin in checkins['items']:
            print (checkin)
            cid = checkin['checkin_id']
            if cid == params['min_id']:
                continue
            elif cid < params['min_id']:
                print('wtf, queried for min_id', params['min_id'], 'and got', cid)
                continue
            if not max_id or cid > max_id: max_id = cid

            when_utc = dateparser.parse(checkin['created_at'])
            timestamp = calendar.timegm(when_utc.timetuple())
            when = EST.normalize(when_utc.astimezone(UTC))
            beer = checkin['beer']['beer_name']
            venue = checkin['venue']['venue_name'] if checkin['venue'] else ''
            checkin_json = json.dumps(checkin)

            
            print(cid, when, beer.encode('utf8'), venue.encode('utf8'))
            c.execute('INSERT OR REPLACE INTO checkins(cid, timestamp, beer, venue, json) values (?, ?, ?, ?, ?)', \
                      (cid, timestamp, beer, venue, checkin_json))
        if max_id is None:
            break
        conn.commit()
        params['min_id'] = max_id
        time.sleep(5)

def backfill():

    c.execute('select min(cid) from checkins')
    row = c.fetchone()
    if row and row[0]:
        params['max_id'] = row[0]

    while True:
        print(params)
        r = requests.get(url, params=params)
        r.raise_for_status()
        response = r.json()['response']
        checkins = response['checkins']
        min_id = None
        for checkin in checkins['items']:
            cid = checkin['checkin_id']
            if params['max_id'] and cid == params['max_id']:
                continue
            if params['max_id'] and cid > params['max_id']:
                continue
            if not min_id or cid < min_id: min_id = cid
            when_utc = dateparser.parse(checkin['created_at'])
            timestamp = int(when_utc.strftime('%s'))
            when = EST.normalize(when_utc.astimezone(UTC))
            beer = checkin['beer']['beer_name']
            venue = checkin['venue']['venue_name'] if checkin['venue'] else ''
            checkin_json = json.dumps(checkin)
            print(cid, when, beer, venue)
            c.execute('INSERT INTO checkins(cid, timestamp, beer, venue, json) values (?, ?, ?, ?, ?)', \
                      (cid, timestamp, beer, venue, checkin_json))
        conn.commit()
        params['max_id'] = min_id
        time.sleep(5)

def get_last_checkin(venue):
     c.execute('select max(timestamp) from checkins where venue=?', (venue,))
     row = c.fetchone()
     return row[0] if row and row[0] else None

def run():
    fillforward()
    
if __name__ == '__main__':
    run()
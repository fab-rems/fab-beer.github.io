import sqlite3
import fill_untappd
import yaml, json
import os, sys
from pprint import pprint
from airtable import Airtable
import pandas as pd

def main():
    base_key = 'appR312nFpbS1UbOH'
    table_name = 'Cans'
    airtable = Airtable(base_key, table_name, api_key="key78z9GoFTdaPlYd")
    record_list = airtable.get_all()
    cans_df = pd.DataFrame([record['fields'] for record in record_list]).loc[lambda x: ~x.code.isna()]
    cans_df.to_csv("../_data/cans.csv")

    fill_untappd.run()

    for i, r in cans_df.iterrows():
        s = yaml.dump(r.to_dict(), default_flow_style=False)
        with open(f"../_cans/{r.code}.md","w") as f:
            f.write("---\n")
            f.write(s)
            f.write("\n---")




    conn = sqlite3.connect("untappd.db")
    df = pd.read_sql_query("select * from checkins limit 5;", conn)

    jsons  = df.json.apply(lambda j: json.loads(j))

    venues = jsons.apply(
        lambda x: 
        pd.concat([
            pd.Series(x["venue"]),
            pd.Series(x["user"])[["user_name"]],
            pd.Series(x["beer"]),
            pd.Series(x)[["checkin_id","created_at","rating_score"]]
            ])
            )

    venues_info = pd.concat([venues, 
    pd.concat([
        venues['contact'].apply(lambda x: pd.Series(x)),
        venues['location'].apply(lambda x: pd.Series(x)),
    ], axis = 1)],axis=1).set_index(["venue_slug","beer_slug"])

    venue_users = venues_info.groupby(["venue_slug","beer_slug"]).user_name.apply(','.join).rename("user_names")
    venue_rating = venues_info.groupby(["venue_slug","beer_slug"]).rating_score.sum().rename("total_rating")
    venue_counts = venues_info.groupby(["venue_slug","beer_slug"]).size().rename("n_checkins")

    venues_info_dedup = venues_info.loc[~venues_info.index.duplicated()]
    venues_annotated = venues_info_dedup.join(pd.concat([venue_users, venue_rating, venue_counts],axis=1))

    venues_annotated.to_csv("../_data/venues.csv")

if __name__ == "__main__":
    os.chdir(os.path.dirname(sys.argv[0]))
    main()
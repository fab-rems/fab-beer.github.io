import pandas as pd
import os
import sys
def main():
    lat0 = 42.3
    lon0 = -71
    delta = 1
    out = pd.read_json(f"http://api.openweathermap.org/data/2.5/box/city?bbox={lon0-delta},{lat0-delta},{lon0+delta},{lat0+delta},10&appid=638cafd5f78c877a2169df3f20322a7a")
    out.list.apply(lambda x: pd.concat([pd.Series(x["wind"]),pd.Series(x["coord"]),pd.Series(x)[["name","id"]]])).set_index("name").to_csv("../_data/weather.csv")

if __name__=="__main__":
    os.chdir(os.path.dirname(sys.argv[0]))
    main()
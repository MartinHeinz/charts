# https://en.wikipedia.org/wiki/List_of_epidemics
# Data for horizontal bar chart

import locale
from urllib.request import urlopen
from bs4 import BeautifulSoup

url = "https://en.wikipedia.org/wiki/List_of_epidemics"  # change to whatever your url is

page = urlopen(url).read()
soup = BeautifulSoup(page)

table = soup.findChildren("table")[0]

rows = table.findChildren(['tr'])

locale.setlocale(locale.LC_ALL, 'en_US.UTF8')

with open("../data/epidemics.csv", "w") as file:
    file.write(f"title,date,span,location,disease,toll\n")
    for i, row in enumerate(rows[1:]):
        cells = row.findChildren('td')
        title = None
        if cells[0].find('a') is not None:
            title = cells[0].find('a')["title"]
        else:
            title = cells[0].string.strip()
        date = cells[1].attrs.get("data-sort-value", "")
        span = cells[1].text.strip()
        location = cells[2].text.strip()
        disease = cells[3].text.strip()
        toll = None
        if cells[4].attrs.get("data-sort-value", None) is not None:
            toll = cells[4].attrs["data-sort-value"]
        else:
            try:
                toll = locale.atoi(cells[4].text.strip().replace("+", ""))
            except ValueError:
                toll = locale.atoi(cells[4].text.strip().split()[0])
        file.write(f"{title.replace(',', ';')},{date},{span},{location.replace(',', ';')},{disease.replace(',', ';')},{str(toll).lstrip('0').replace(',', '') or '0'}\n")
        print(f"{i:<7}{title:<75}{date:<6}{span:<15}{location:<85}{disease:<75}{toll}")

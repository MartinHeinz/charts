# Collection of Charts and Data Visualizations

Live Demo: <https://martinheinz.github.io/charts/>

## Available Charts and Plots

### Beeswarm Chart

Chart Demo: <https://martinheinz.github.io/charts/beeswarm/>

Original data taken from WHO Suicide Statistics
- Basic historical (1979-2016) data by country, year and demographic groups
- <https://www.kaggle.com/szamil/who-suicide-statistics>

Parsed and cleaned dataset can be found [here](data/who_suicide_stats.csv).

### Parallel Coordinate Chart

Chart Demo: <https://martinheinz.github.io/charts/parallel-coordinates/>

Original data taken from OECD - <https://stats.oecd.org/>:
- ICT Access and Usage by Households and Individuals - H1K - Individuals who have written computer code - last 12 m

Parsed and cleaned dataset can be found [here](data/ICT_HH2_13062020143325255_H1K_all.csv).

## Data Processing and Parsing

Used datasets needed some level of preprocessing and parsing before being used for visualization.

Code used for preprocessing can be found in directory [here](preprocessing).

## Future Datasets and Sources

### Datasets

- OECD - <https://stats.oecd.org/>
    - Exposure to PM2.5 in countries and regions - `EXP_PM2_5_11062020205613690.csv`
    - Patents by Technology - `PATS_IPC_11062020210633596.csv`
    - Broadband Database - `BROADBAND_DB_11062020214338289.csv`
        - Broadband Fibre/Lan subs. per 100 inhabitants
        - Mobile data usage per mobile broadband subscription, GB per month
        
    - ICT Access and Usage by Households and Individuals - `ICT_HH2_13062020143325255`
        - C2B - Individuals using a computer - last 3 m
        - C5B - Individuals using a internet - last 3 m
        - H1M - Individuals who have installed or replaced an operating system - last 12 m
        - H1K - Individuals who have written computer code - last 12 m
        - G1 - Individuals who have purchased online - last 12 m
    
- Health Nutrition and Population Statistics - State of human health across the world
    - <https://www.kaggle.com/theworldbank/health-nutrition-and-population-statistics/data>
    
- National Health and Nutrition Examination Survey - NHANES datasets from 2013-2014
    - <https://www.kaggle.com/cdc/national-health-and-nutrition-examination-survey>
    
- Epicurious - Recipes with Rating and Nutrition
    - <https://www.kaggle.com/hugodarwood/epirecipes>

### Sources

- <https://datasetsearch.research.google.com/>
- <https://data.europa.eu/euodp/en/data>
- <https://towardsdatascience.com/top-10-great-sites-with-free-data-sets-581ac8f6334>
- <https://comtrade.un.org/data/>
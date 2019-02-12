# Node GA Downloader

Projekt pro nesamplované tahání dat z GA do CSV a účelem přelití do BigQuery.

## Prerekvizity
Je třeba:
 
 - nodejs a npm
 - service account pro Google analytics API. https://developers.google.com/analytics/devguides/reporting/core/v2/authorization#service_accounts 
 - tento service account přidaný do GA, které chceme tahat.

## Instalace
Instaluje se jako globální modul. 

```
npm install -g https://github.com/etnetera-activate/ga-downloader.git
```

nebo dle vašeho nastavení

```
sudo npm install -g https://github.com/etnetera-activate/ga-downloader.git
```

Následně si připravte JSON file s credentials service accountu. Buďto je nahrajte do adresáře jako `auth.json` a nebo na ně musíte odkazovat.

## Použití a funkce

Pro nápovědu stačí:
```
gadownloader --help
```

Povinné parametry:

- `--profileId` 
- `--dateFrom` ve formáty YYYY-MM-DD.
- `--metrics` typu `ga:sessions,ga:users`

Další parametry:

- `--dimensions` ve formátu ala metrics. Pozor - nepoužívejte dimenzi `ga:date`, tu dopňuje sám program.
- `--filters` je string pro filtr dle API GA.
- `--segment` je string pro segment dle API GA.

- `--dateTo` ve formáty YYYY-MM-DD. pokud je zadáno tahá se po dnech od *dateFrom* do *dateTo*. Pokud není zadáno, tahá se jen jeden den odpovídající *dateFrom*
- `--authFile` je cesta k JSON souboru s credentials. Default je `./auth.json`
- `--format` je formát výstupu. Zatím jen CSV


## Příklad použití

```
gadownloader -p 26893096 -f "2019-01-01" -t 2019-01-05 -m "ga:sessions" -d "ga:source,ga:medium,ga:keyword" > out.csv

bq load --autodetect  myGaDataset.gaExport out.csv

```

nebo s odkazem na authfile.

```
gadownloader -p 26893096 -f "2019-01-01" -m "ga:sessions" -d "ga:source,ga:medium,ga:keyword" -a "/home/someone/auth.json" > out.csv

bq load --autodetect  myGaDataset.gaExport out.csv

```


## Todo

- filtry, segmenty
- JSON format

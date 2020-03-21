# Price Scraper

This project is intended to help obtain historical pricing information from past auctions.

A list of part numbers is provided as input, and the script outputs a list of part numbers with the most recent N selling prices.

## Input Format

The input is provided as a CSV file with the following column format.

| Manufacturer | Part Number |
| ------------ | ----------- |
| ABC          | 0123456A    |
| Ford         | 1313994F    |

## Output Format

The output is a CSV with the following column format. In this example, the number of prices to fetch (N) is 5. One row per price found will be generated. The input file will not be modified.

| Manufacturer | Part Number | Price  | Link               |
| ------------ | ----------- | -----  | ------------------ |
| ABC          | 0123456A    | $1.00  | http://github.com  |
| ABC          | 0123456A    | $1.50  | http://github.com  |
| ABC          | 0123456A    | $1.25  | http://github.com  |
| ABC          | 0123456A    | $4.99  | http://github.com  |
| ABC          | 0123456A    | $9.98  | http://github.com  |
| Ford         | 1313994F    | $19.99 | http://github.com  |
| Ford         | 1313994F    | $21.99 | http://github.com  |
| Ford         | 1313994F    | $18.49 | http://github.com  |
| Ford         | 1313994F    | $13.95 | http://github.com  |
| Ford         | 1313994F    | $12.49 | http://github.com  |


## Platform / Language

This project could be implemented in a variety of programming languages. The top two choices at this moment are Python and Javascipt on Electron.


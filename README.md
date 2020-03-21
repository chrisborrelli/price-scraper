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

## How To Contribute

1. First you need git.
  - For Linux or Mac, you already have it
  - For Windows, download Git here: https://git-scm.com/downloads

2. Fork the repository by clicking fork button on GitHub.
  - You can store the fork in your own GitHub user area.

3. Clone the forked repository from your user area on GitHub.

  `$ git clone https://github.com/<your-username/price-scraper.git`

4. Setup remotes.

  `$ git remote -v`

  `$ git remote add upstream https://github.com/chrisborrelli/price-scraper.git`
 
  `$ git remote -v'

5. Create a branch. Don't every make changes directly on 'master'

  `$ git branch -b new-branch`
  
  `$ git push origin new-branch`

6. You can now make changes to files with your favorite text editor.

  `$ vim README.md`

7. Stage and commit the changes to your local repository. This only updates the branch on your local repository on your local machine hard disk.

  `$ git commit -a -m 'Added a message here...'`

8. Push the changes to your local branch to your original (the fork repo in your GitHub).

  `$ git push origin`

9. Goto to GitHub and start and complete the Pull Request process to get these changes into the Upstream Repository Master Branch.

10. Keep your fork and cloned local repositories up-to-date.

  `$ git fetch upstream
  
   $ git checkout master
  
   $ git merge upstream/master
   
   $ git push origin master`


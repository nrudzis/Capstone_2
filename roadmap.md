# Swap - Roadmap

This document outlines current and planned milestones for the Swap project.
- TODO: Add estimated times for completion (proximate milestones)

*Updated: Mon, 31 Mar 2025 06:19:33 GMT*

## Swap

### Completed
- Jest tests for User and MarketApi clases
- Ability to purchase assets (Alpaca markets API)
- Revise roadmap order to reflect priority of minimal requirements
- Send/receive funds backend route logic/error handling
- New SQL tables for asset purchases/sales

### To Do
#### Login
- Login route, tokens

#### Auth
- Auth middleware

#### Publish minimal working version of app
- With basic UI and above capabilities working, move to production version
    - Render for client
    - Supabase for server

#### Fund account
- Add ability for new users to fund their account with fake money
    - Add logic to button that funds user account when balance is $0

#### Home page, User account UI
- Home page
    - Replace Vite boilerplate
- User account page
    - Add more structure
    - Display minimum db data
    - Account balance
    - Pie chart for asset types owned (initially only one)

#### Send/receive funds
- Front end form/React UI to send funds to other users

#### Automate with CI
- Create a basic CI workflow and automate with GitHub Actions
    - If dev version changes pass (tests?, linter?), push to production
    - Push local production to Render, Supabase

#### Historic account value in db/UI
- Keep track of users daily closing account balance value in db
- Add line chart to show account value over time

#### Send/recieve non-cash assets
- Ability to send non-cash assets to other users

#### More...

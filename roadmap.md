# Swap - Roadmap

This document outlines current and planned milestones for the Swap project.
- TODO: Add estimated times for completion (proximate milestones)

*Updated: Tue, 04 Feb 2025 23:32:58 GMT*

## Swap

#### Home page, User account UI
- Home page
    - Replace Vite boilerplate
- User account page
    - Add more structure
    - Display minimum db data
    - Account balance
    - Pie chart for asset types owned (initially only one)

#### Fund account
- Add ability for new users to fund their account with fake money
    - Add logic to button that funds user account when balance is $0

#### Send/receive funds
- Add ability for users to send funds to other users
    - Form, logic to adjust balances, error handling

#### Publish minimal working version of app
- With basic UI and above capabilities working, move to production version
    - Render for client
    - Supabase for server

#### Automate with CI
- Create a basic CI workflow and automate with GitHub Actions
    - If dev version changes pass (tests?, linter?), push to production
    - Push local production to Render, Supabase

#### API for other purchases
- Ability to purchase assets (Alpaca markets API)

#### Historic account value in db/UI
- Keep track of users daily closing account balance value in db
- Add line chart to show account value over time

#### Send/recieve non-cash assets
- Ability to send non-cash assets to other users

#### Login
- Login route, tokens

#### Auth
- Auth middleware

#### More...

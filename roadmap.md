# Swap - Roadmap

This document outlines current and planned milestones for the Swap project.
- TODO: Add estimated times for completion (proximate milestones)

*Updated: Fri, 16 May 2025 03:18:37 GMT*

## Swap

### Completed
- Jest tests for User and MarketApi clases
- Ability to purchase assets (Alpaca markets API)
- Revise roadmap order to reflect priority of minimal requirements
- Send/receive funds backend route logic/error handling
- New SQL tables for asset purchases/sales
- Login route, tokens
- Auth middleware
- Add ability for new users to fund their account with fake money
    - Add logic to button that funds user account when balance is $0
- Front end form to send funds to other users
- Messages to to provide feedback to users
- Home page
    - Replace Vite boilerplate
- User account page
    - Display minimum db data
    - Account balance
- With basic UI and above capabilities working, move to production version
    - Render for client, server
    - Supabase for db

### To Do

#### Form validation
- Add client side validation, server side validation with JSON schema

#### Home page, User account UI
- Improve styling with CSS, MUI
- Chart for asset types owned (initially only one)
- Display additional info from db, like transaction history

#### Additional testing
- Fix broken tests, add more test coverage

#### Additional views
- User edit, delete information

#### Automate with CI
- Create a basic CI workflow and automate with GitHub Actions
    - If dev version changes pass (tests?, linter?), push to production
    - Push local production to Render, Supabase

#### Historic account value in db/UI
- Keep track of users daily closing account balance value in db
- Add line chart to show account value over time

#### Send/recieve non-cash assets
- Ability to send non-cash assets to other users

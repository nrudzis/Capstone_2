# Swap - Roadmap

This document outlines current and planned milestones for the Swap project.
- TODO: Add estimated times for completion (proximate milestones)

*Updated: Sat, 21 Jun 2025 01:29:41 GMT*

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
- Client-side validation with React Hook Form, server-side validation with jsonschema
    - implemented for Login/Register forms (client) and routes (server)
    - implemented for SendFunds and BuySell in user account page
- UI
    - initial MUI TextField and Button components for Login/Register and welcome page
- Testing
    - Fix broken tests, complete backend tests

### To Do

#### Home page, User account UI
- Display additional info from db, like transaction history
- Improve User account page styling
  - Chart for asset types owned (initially only one)

#### Additional views
- User edit, delete information

#### Server-side validation
- Validate data from MarketApi service with json schema

#### Automate with CI
- Create a basic CI workflow and automate with GitHub Actions
    - If dev version changes pass (tests?, linter?), push to production
    - Push local production to Render, Supabase

#### Historic account value in db/UI
- Keep track of users daily closing account balance value in db
- Add line chart to show account value over time

#### Send/recieve non-cash assets
- Ability to send non-cash assets to other users

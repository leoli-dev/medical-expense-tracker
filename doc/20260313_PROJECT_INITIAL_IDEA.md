# Medical Expense Tracker - Initial Project Idea

## Why This Project?

I hate to manually track the medical expense every year for tax purposes. I want to build a mobile app (js one, not native) to track the medical expense one by one, also track the claim status, and the reimbursement amount, so that I can easily export the data to a csv file for tax purposes, and have an idea of how much I can claim in tax return.

## What I Want to Build?

- A mobile app, not native, but mobile first, each view much be considered for rendering in mobile screens.
- With backend, which connect to a DB and with a AI processor to analyze the upload receipts(image like jpg, png, pdf) and extract the data like date, amount, and description.
- It should has a login system, design for multiple user usage, for security and privacy reasons. It doesn't necessary need a sign up form, the user can be created via CLI of backend, as for personal use.
- The expense data should contains: paid_date, paid_amount, description, claim_date, reimbursement_amount.
- The app should have the favion, nice mobile icon and a nice UI design. If LLM cannot generate images, at least generate the prompt for icons, and generate placeholder images.
- The app should show the expense data by year, each year should be a list of the expense, which ordered by date ASC
- each expense should be able to be edited, and the claim status and reimbursement amount should be able to be updated when the claim is processed.
- There should be a total shown in the page for summing up the paid amount and reimbursement amount for each year, so that I can easily see how much I have spent and how much I can claim in tax return.
- There should be an export button to export the data to a csv file for the current year shown in the page.
- A upload file function, which can upload recipts in image format (jpg, png, pdf), and the AI processor can extract the data and fill in the form automatically, so that I don't need to manually input the data one by one.
- The AI processor provider interface should be designed in a way that it can be easily switched to different providers, so that I can choose the one that best fit my needs and budget. (Default: use OpenAI API.)

## What I expeced?

- A solid plan with a clear tech stack, architecture, and implementation details.
- A MVP version of the app, with a deployment guide.

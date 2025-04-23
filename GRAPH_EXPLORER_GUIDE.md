# Accessing Microsoft Graph API Data Using Graph Explorer

This guide explains how to access your Microsoft Graph API calendar data without needing admin access to register an application. The Microsoft Graph Explorer is a web-based tool that lets you make API requests to your Microsoft 365 data using your existing credentials.

## What is Graph Explorer?

Graph Explorer is an interactive browser-based tool that lets you execute Microsoft Graph API calls and see the responses without needing to register an application or write code. It's perfect for:

- Exploring what data is available through Microsoft Graph
- Testing API calls before implementing them in your code
- Downloading your own data when you don't have application registration privileges
- Learning how the Microsoft Graph API works

## Step 1: Access Graph Explorer

1. Navigate to [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Click the "Sign In" button in the top right corner
3. Sign in with your Microsoft account (the same one you use for Outlook/Office 365)

## Step 2: Request Calendar Access Permissions

Before you can access your calendar data, you need to consent to the appropriate permissions:

1. Click on the "Consent to permissions" button in the left sidebar or when prompted
2. Select the following permissions:
   - Calendars.Read
   - Calendars.ReadBasic
   - User.Read
   - People.Read
   - offline_access (for better token handling)
3. Click "Consent" to approve these permissions

## Step 3: Get Your Calendar Events

Now you can request your calendar events:

1. Change the request method to `GET` in the dropdown menu (should be the default)
2. Enter the following URL in the request box:
   ```
   https://graph.microsoft.com/v1.0/me/calendar/events
   ```
3. Click "Run query"

The response will appear in the right panel, showing your calendar events in JSON format.

## Step 4: Refine Your Query (Optional)

To get more specific data, you can refine your query:

### Get Events for a Specific Date Range

```
https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=2025-04-23T00:00:00Z&endDateTime=2025-04-30T00:00:00Z
```

### Limit the Number of Events

```
https://graph.microsoft.com/v1.0/me/calendar/events?$top=10
```

### Sort Events by Start Time

```
https://graph.microsoft.com/v1.0/me/calendar/events?$orderby=start/dateTime
```

### Select Specific Fields

```
https://graph.microsoft.com/v1.0/me/calendar/events?$select=subject,start,end,location,attendees
```

## Step 5: Download Your Data

Once you've found the right query to get the data you need:

1. Examine the JSON response in the right panel
2. Click the "Download" button (or copy and paste the JSON)
3. Save the file as `mockCalendarData.json` in your project directory

## Step 6: Use the Data in Your Meeting Prep App

1. Place the downloaded `mockCalendarData.json` file in your project's `src` directory
2. Import it in your `MeetingPrepApp.tsx` file:
   ```typescript
   import mockCalendarData from './mockCalendarData.json';
   ```
3. The app will now use this real data from Graph API instead of mock data

## Tips for Using Graph Explorer

- **Pagination**: If you have many events, the API might return only a subset. Look for an `@odata.nextLink` property in the response to get the next page of results.
- **Throttling**: Microsoft Graph API has rate limits. If you hit these limits, you'll receive a 429 error. Wait a few minutes and try again.
- **Documentation**: Click on the "Docs" link in Graph Explorer to see detailed documentation for each API endpoint.
- **Authentication Tokens**: Graph Explorer handles authentication tokens for you. In a real application, you'd need to implement authentication using libraries like MSAL.

## Privacy and Security

Before sharing your application or code:

1. Always remove or anonymize personal data from your `mockCalendarData.json` file
2. Consider using the anonymization scripts provided earlier to automatically sanitize your data
3. Never commit raw calendar data containing PII to public repositories

By using Graph Explorer, you can access your Microsoft Graph data without needing administrative privileges to register an application, making it an ideal solution for educational institutions or enterprise environments with restricted access.

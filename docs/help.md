# Horizon Help

## Overview
Horizon provides a team planning timeline that shows employees on rows and time on the horizontal axis. It combines Workday data with manual events so teams can see coverage at a glance.

## Roles and Permissions
- Admin: full access to configuration, teams, employees, event types, and all events. Can create global events and manage all data.
- Team Owner (Manager): manages team membership, team-level events, and event types for their team.
- User: views team planning and can create, update, and delete only their own events within their team and allowed event types.

## Signing In
- Dev mode uses local JWTs and seeded users (default password is `root`).
- SSO mode uses Azure Entra ID. If SSO is enabled for your organization, you will sign in with your corporate identity.
- Non-admin users cannot sign in if their linked employee is inactive.

## Team Planning View
- Use the team selector in the header to choose which team you are viewing.
- Use the granularity selector (Day, Month, Quarter, Year) to change the timeline scale.
- Use event type filters to focus on specific categories (for example: Vacation, Training, Team events).
- The left sidebar shows only employees in the selected team. Search filters within that team.
- Each employee row shows up to 3 overlapping events. If there are more, you will see a "+N events" indicator.
- Click the employee name to expand or collapse aggregated events.
- Global and team events appear as subtle background bands across rows.

## Events
- Events always have a start date and end date (inclusive). Half-days are not supported.
- Users can create events for themselves only, within their current team and allowed event types.
- Team Owners can create team-level events for their team.
- Admins can create global events that apply to everyone.
- Drag-and-drop creation is not supported.

## Sharing a View
- Use the Share View action to generate a read-only link for the current view (team, date range, granularity, filters).
- Share links are read-only and cannot be edited.
- Share routes are `/share/:token` and `/shares/:token`.

## Employees and Data Sources
- Workday is the system of record for employees (internal and external).
- Manual events exist only in Horizon and are not synced back to Workday.

## Profile and Passwords
- You can update your password in Profile > Security only if you are not linked to an employee or your last login was not SSO.

## Troubleshooting
- If you cannot see an employee, confirm they belong to the selected team.
- If you cannot log in, check whether your employee record is active or whether SSO is required.
- If a share link looks different than expected, regenerate it after adjusting the timeline filters.

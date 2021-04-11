# Family Board - in Python with Flask

Use [Flask](https://palletsprojects.com/p/flask/) and HTML/CSS/JavaScript for Family Board on **Raspberry Pi Zero W**.

## configure Microsoft Graph / Outlook / Live calendar access

- https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
- select `Applications from personal account`
- new registration
- click `Only associate with personal account`
- enter name
- select `Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)`
- enter redirect URL - e.g. for local development & testing: http://localhost:8080/msgtoken
- add API permissions `Microsoft.Graph / delegated`
  * Calendars.Read
  * Files.Read.All
- create a script and set environment variables before starting `server.py`
  * MSG_CLIENT_ID
  * MSG_CLIENT_SECRET
  * MSG_AUTHORITY
- optionally set
  * MSG_CALENDAR_PATTERN : a Regex pattern selecting the names of calendars the above application has access to / can be checked with `/v1.0/me/calendars` in [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
- when started login to MS account with http://localhost:8080/login
- a token that will be refreshed automatically is then stored on servers filesystem - `MSG_CACHE_FILE` application configuration setting

> after putting sensitive values in `.vscode/launch.json` it makes sense to exclude this file from __git commit__ with `git update-index --assume-unchanged .vscode/launch.json`

## configure Google Calendar API

https://developers.google.com/calendar

- Enable the Google Calendar API / create new project name
- configure OAuth client - Web server
- redirect URL : http://localhost:8080/googletoken
- create a script and set environment variables before starting `server.py`
  * GOOGLE_CLIENT_ID
  * GOOGLE_CLIENT_SECRET
- add `export OAUTHLIB_INSECURE_TRANSPORT=1` to allow authentication client w/o https
- when started login to Google account with http://localhost:8080/login
- a token that will be refreshed automatically is then stored on servers filesystem - `MSG_CACHE_FILE` application configuration setting

### configure locale

To show calendar events with local month and day designations, a locale can be set. Before using a locale in environment variable `MSG_LOCALE` it needs to be setup on Linux / Raspbian / Codespaces

```sh
sudo locale-gen de_DE.UTF-8
```

now `MSG_LOCALE` can be set (in the script which starts `server.py`)

```sh
export MSG_LOCALE=de_DE.utf8
```

---

## hints

### activate virtual environment with bash

```sh
source .venv/bin/activate
```

from https://docs.python.org/3/library/venv.html

---

Any questions? [@ancientitguy](https://twitter.com/ancientitguy)
# RetrospectiveRND

A lightweight, real-time sprint retrospective board built with React and Firebase.

RetrospectiveRND was created after I encountered a practical limitation while running retrospectives for a university R&D project: many existing retrospective tools allow basic usage for free, but require a paid plan when you want to create and maintain multiple boards.

Rather than working around that limitation, I built my own retrospective application that supports multiple persistent boards while keeping the workflow simple and focused on what a team actually needs during a sprint retrospective.

## The Problem

Sprint retrospectives are an important part of Agile development, giving teams an opportunity to reflect on what worked, what did not, what was learned, and what could be improved in the next sprint.

While several online retrospective tools already exist, some restrict features such as creating multiple boards behind paid plans. For a student development team running retrospectives repeatedly across multiple sprints, this introduced an unnecessary limitation.

RetrospectiveRND was built as a simple alternative that could:

* Create and retain multiple retrospective boards
* Store retrospective notes between sessions
* Allow the team to organise and prioritise feedback
* Provide a straightforward interface without unnecessary features
* Support repeated retrospectives without requiring a paid subscription

## Features

### Multiple Retrospective Boards

Create separate boards for different sprints and return to previously created retrospectives at any time.

Boards are stored using Firebase Firestore rather than existing only within the browser session.

### Four-Category Retrospective Format

Each board follows a four-column retrospective structure:

| Category         | Purpose                                          |
| ---------------- | ------------------------------------------------ |
| 👍 **Liked**     | What went well during the sprint                 |
| 🧠 **Learned**   | What the team learned                            |
| 😕 **Lacked**    | What was missing or could have been better       |
| ✨ **Longed For** | What the team would like to introduce or improve |

### Real-Time Persistence

Board data is stored in Firebase Firestore and synchronised using real-time listeners.

Changes to cards are reflected in the board without requiring a manual refresh.

### Drag and Drop

Cards can be:

* Reordered within a column
* Moved between retrospective categories
* Prioritised visually during discussion

Drag-and-drop functionality is implemented using **dnd-kit**.

### Voting

Team members can upvote retrospective cards to help identify recurring concerns, important discussion points, or ideas worth prioritising.

### Card Management

Each retrospective card can be:

* Added
* Edited
* Copied to the clipboard
* Pinned
* Unpinned
* Deleted
* Reordered
* Moved between categories

Pinned cards automatically appear above unpinned cards within their category.

## Tech Stack

| Technology             | Purpose                                |
| ---------------------- | -------------------------------------- |
| **React**              | Component-based frontend               |
| **Vite**               | Development and build tooling          |
| **Firebase Firestore** | Persistent and real-time board storage |
| **dnd-kit**            | Drag-and-drop interaction              |
| **JavaScript**         | Application logic                      |
| **CSS**                | Application styling                    |
| **ESLint**             | Code quality and linting               |

## How It Works

The application has two main views.

### Board Selection

The home screen displays existing retrospective boards and allows a new board to be created.

When a board is created, its details are persisted in Firestore so it remains available for future sessions.

### Retrospective Board

Opening a board displays the four retrospective categories.

Each card is stored within the selected board and contains information such as:

* Retrospective category
* Card text
* Vote count
* Pinned state
* Creation time
* Display order

Firestore real-time listeners keep the interface synchronised with the stored board data.

## Project Structure

```text
retrospectiveRND/
├── public/
├── src/
│   ├── components/
│   │   ├── Board.jsx
│   │   ├── Board.css
│   │   └── Card.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── firebase.js
│   ├── index.css
│   └── main.jsx
├── firebase.json
├── package.json
├── vite.config.js
└── README.md
```

## Running Locally

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/v-spnz/retrospectiveRND.git
```

Navigate into the project:

```bash
cd retrospectiveRND
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide the local development URL in the terminal.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run preview
```

Runs the production build locally for testing.

```bash
npm run lint
```

Runs ESLint across the project.

## Why I Built This

This project began with a small but genuine problem.

During a university R&D project, my team needed to conduct sprint retrospectives regularly. The retrospective platform we were using limited the number of boards available without paying for an upgraded plan.

Because each sprint benefited from having its own retrospective history, continually replacing or deleting previous boards was not ideal.

I decided to build a purpose-built alternative.

What started as a solution to a simple workflow problem became an opportunity to build a small full-stack application involving persistent cloud data, real-time updates, component-based frontend development, and interactive drag-and-drop behaviour.

It is an example of identifying a problem within a development workflow and creating a practical software solution rather than simply accepting the limitation.

## What I Learned

Building RetrospectiveRND gave me practical experience with:

* Building reusable React components
* Managing state with React hooks
* Integrating a React application with Firebase Firestore
* Working with real-time database listeners
* Designing Firestore collections and documents
* Implementing asynchronous CRUD operations
* Building drag-and-drop interfaces
* Maintaining custom ordering across persisted data
* Creating interactive card-based UI components
* Translating a problem experienced by a development team into a working software tool

## Potential Improvements

The current application focuses on the core retrospective workflow. Future development could include:

* User authentication
* Private and team-specific boards
* Shareable board links
* Role-based board permissions
* Anonymous retrospective submissions
* Per-user voting restrictions
* Sprint dates and board metadata
* Board archiving and deletion
* Exporting retrospectives to PDF or Markdown
* Retrospective templates
* Action items created directly from cards
* Improved mobile responsiveness
* Automated testing
* Accessibility improvements

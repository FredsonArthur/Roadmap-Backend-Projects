#!/usr/bin/env node
'use strict';

const API_BASE = 'https://api.github.com';

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

// ---------- Acesso à API ----------

async function fetchEvents(username) {
  const url = `${API_BASE}/users/${encodeURIComponent(username)}/events`;
  let response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'github-activity-cli',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
  } catch (err) {
    fail('Could not reach the GitHub API. Check your internet connection and try again.');
  }

  if (response.status === 404) {
    fail(`User "${username}" not found.`);
  }
  if (response.status === 403 || response.status === 429) {
    fail('GitHub API rate limit exceeded. Wait a few minutes and try again.');
  }
  if (!response.ok) {
    fail(`GitHub API request failed (HTTP ${response.status}).`);
  }

  try {
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('unexpected response');
    return data;
  } catch (err) {
    fail('Received an invalid response from the GitHub API.');
  }
}

// ---------- Formatação ----------

function pushedCommits(payload) {
  if (typeof payload.size === 'number') return payload.size;
  if (Array.isArray(payload.commits)) return payload.commits.length;
  if (typeof payload.distinct_size === 'number') return payload.distinct_size;
  return null;
}

function describeEvent(event) {
  const repo = event.repo ? event.repo.name : 'unknown repository';
  const payload = event.payload || {};
  const action = payload.action;

  switch (event.type) {
    case 'PushEvent': {
      const count = pushedCommits(payload);
      if (count === null) return `Pushed commits to ${repo}`;
      return `Pushed ${count} ${count === 1 ? 'commit' : 'commits'} to ${repo}`;
    }
    case 'IssuesEvent':
      if (action === 'opened') return `Opened a new issue in ${repo}`;
      if (action === 'closed') return `Closed an issue in ${repo}`;
      if (action === 'reopened') return `Reopened an issue in ${repo}`;
      return `Updated an issue in ${repo}`;
    case 'IssueCommentEvent':
      return `Commented on an issue in ${repo}`;
    case 'PullRequestEvent':
      if (action === 'opened') return `Opened a pull request in ${repo}`;
      if (action === 'closed' && payload.pull_request && payload.pull_request.merged) {
        return `Merged a pull request in ${repo}`;
      }
      if (action === 'closed') return `Closed a pull request in ${repo}`;
      if (action === 'reopened') return `Reopened a pull request in ${repo}`;
      return `Updated a pull request in ${repo}`;
    case 'PullRequestReviewEvent':
      return `Reviewed a pull request in ${repo}`;
    case 'PullRequestReviewCommentEvent':
      return `Commented on a pull request in ${repo}`;
    case 'WatchEvent':
      return `Starred ${repo}`;
    case 'ForkEvent':
      return `Forked ${repo}`;
    case 'CreateEvent':
      if (payload.ref_type === 'repository') return `Created the repository ${repo}`;
      return `Created a ${payload.ref_type || 'ref'} in ${repo}`;
    case 'DeleteEvent':
      return `Deleted a ${payload.ref_type || 'ref'} in ${repo}`;
    case 'ReleaseEvent':
      return `Published a release in ${repo}`;
    case 'PublicEvent':
      return `Made ${repo} public`;
    case 'MemberEvent':
      return `Added a collaborator to ${repo}`;
    default:
      return `${event.type.replace(/Event$/, '')} in ${repo}`;
  }
}

// ---------- Entrada ----------

async function main() {
  const username = process.argv[2];

  if (!username || username.trim() === '') {
    console.error('Usage: github-activity <username>');
    process.exit(1);
  }

  const events = await fetchEvents(username.trim());

  if (events.length === 0) {
    console.log(`No recent public activity found for "${username}".`);
    return;
  }

  console.log(`Recent activity of ${username}:`);
  events.forEach((event) => console.log(`- ${describeEvent(event)}`));
}

main();
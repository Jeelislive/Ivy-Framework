import { Users, ExternalLink } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Contributor {
  login: string;
  name?: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  role?: string;
  isIvyMember?: boolean;
}

interface GitHubCommit {
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
}

interface GitHubContributorsProps {
  documentSource?: string;
  onLoadingChange?: (isLoading: boolean) => void;
  show?: boolean;
}

// Ivy team members with their roles
const IVY_TEAM_MEMBERS: Record<string, string> = {
  ArtemKhvorostianyi: 'Engineer',
  rorychatt: 'Founding Engineer',
  nielsbosma: 'CEO',
  zachwolfe: 'Software Developer',
  // Add more team members as needed
};

// Helper function to generate correct commits URL for main branch
const getCommitsUrl = (githubUrl: string): string => {
  try {
    const url = new URL(githubUrl);
    const pathParts = url.pathname.split('/');

    // Expected format: /owner/repo/blob/branch/path/to/file
    if (pathParts.length >= 6 && pathParts[3] === 'blob') {
      const owner = pathParts[1];
      const repo = pathParts[2];
      const filePath = pathParts.slice(5).join('/');

      // Generate commits URL for main branch with specific file path
      return `https://github.com/${owner}/${repo}/commits/main/${filePath}`;
    }
  } catch (error) {
    // If URL parsing fails, return the original URL as fallback
    console.warn('Failed to parse GitHub URL for commits link:', error);
  }

  // Fallback to original behavior if parsing fails
  return githubUrl.replace('/blob/', '/commits/');
};

export const GitHubContributors: React.FC<GitHubContributorsProps> = ({
  documentSource,
  onLoadingChange,
  show = true,
}) => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentSource) {
      onLoadingChange?.(false);
      return;
    }

    // Extract repo and file path from GitHub URL
    const getApiUrl = (githubUrl: string): string | null => {
      try {
        const url = new URL(githubUrl);
        const pathParts = url.pathname.split('/');

        // Expected format: /owner/repo/blob/branch/path/to/file
        if (pathParts.length < 6 || pathParts[3] !== 'blob') {
          return null;
        }

        const owner = pathParts[1];
        const repo = pathParts[2];
        const filePath = pathParts.slice(5).join('/');

        // Always fetch contributors from the main branch, regardless of the source URL branch
        return `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(filePath)}&sha=main&per_page=20`;
      } catch {
        return null;
      }
    };

    const apiUrl = getApiUrl(documentSource);
    if (!apiUrl) {
      onLoadingChange?.(false);
      return;
    }

    onLoadingChange?.(true);

    fetch(apiUrl)
      .then(response => {
        setError(null);
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error(
              'GitHub API rate limit exceeded. Please try again later.'
            );
          } else if (response.status === 404) {
            throw new Error('Repository or file not found.');
          } else {
            throw new Error(`GitHub API error: ${response.status}`);
          }
        }
        return response.json();
      })
      .then((commits: GitHubCommit[]) => {
        // Extract unique contributors from commits
        const contributorMap = new Map<string, Contributor>();

        commits.forEach(commit => {
          if (commit.author) {
            const login = commit.author.login;
            if (contributorMap.has(login)) {
              contributorMap.get(login)!.contributions += 1;
            } else {
              const isIvyMember = login in IVY_TEAM_MEMBERS;
              contributorMap.set(login, {
                login: commit.author.login,
                name: commit.commit.author.name,
                avatar_url: commit.author.avatar_url,
                html_url: commit.author.html_url,
                contributions: 1,
                role: isIvyMember
                  ? IVY_TEAM_MEMBERS[login]
                  : 'Open Source Contributor',
                isIvyMember,
              });
            }
          }
        });

        const sortedContributors = Array.from(contributorMap.values()).sort(
          (a, b) => b.contributions - a.contributions
        );

        setContributors(sortedContributors);
      })
      .catch(err => {
        console.error('Failed to fetch contributors:', err);
        // Don't show error for rate limiting - just hide the component
        if (err.message && err.message.includes('rate limit exceeded')) {
          setError(null);
        } else {
          setError(err.message || 'Failed to load contributors');
        }
      })
      .finally(() => {
        onLoadingChange?.(false);
      });
  }, [documentSource, onLoadingChange]);

  if (!documentSource || !show) return null;

  // Don't render anything if we have no contributors and no error (likely rate limited)
  if (!error && contributors.length === 0) return null;

  const displayedContributors = contributors.slice(0, 3);
  const remainingCount = contributors.length - 3;
  const hasMoreContributors = remainingCount > 0;

  return (
    <div>
      <div className="text-body mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Contributors
      </div>

      {error && (
        <div className="flex-shrink-0 min-h-40">
          <div className="pr-2">
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </div>
      )}

      {!error && contributors.length > 0 && (
        <div className="flex-shrink-0 min-h-40 overflow-hidden">
          {/* Contributors list*/}
          <div className="h-full pr-2">
            <div className="space-y-3">
              {displayedContributors.map(contributor => (
                <a
                  key={contributor.login}
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors group"
                >
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {contributor.name || contributor.login}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {contributor.role}
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* "and X more" link */}
          {hasMoreContributors && (
            <div className="pr-2 pt-4">
              <a
                href={getCommitsUrl(documentSource)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                and {remainingCount} more
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

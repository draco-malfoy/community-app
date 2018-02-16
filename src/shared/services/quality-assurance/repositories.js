
import GitApi from 'services/quality-assurance/git-api';

class RepositoryService {
  constructor() {
    this.private = {
      gitapi: new GitApi('https://api.github.com', true),
    };
  }

  async listRepositories() {
    const res = await this.private.gitapi.get(
      '/user/repos?sort=pushed&direction=desc&page=1&per_page=100', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      },
    );
    if (!res.ok) throw new Error(res.statusText);
    if (res.status !== 200) throw new Error(res.content);
    return res.json();
  }
}

export function getService() {
  return new RepositoryService();
}

export default undefined;

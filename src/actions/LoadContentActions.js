import AsyncRequestResponseAction from './AsyncRequestResponseAction';
import fetch from '../core/fetch';

class LoadContentAction extends AsyncRequestResponseAction {
  constructor(contentPath) {
    super('CONTENT_LOAD_CONTENT', contentPath, path => new Promise(async (resolve, reject) => {
      const query = `/graphql?query={content(path:"${path}"){path,title,content,component}}`;
      try {
        const response = await fetch(query);

        if (!response.ok) {
          reject('Error performing fetch');
          return;
        }

        const { data } = await response.json();
        if (!data || !data.content) {
          resolve({ content: null });
          return;
        }

        resolve(data.content);
      } catch (e) {
        reject('Exception while performing fetch');
      }
    }));
  }
}

export { LoadContentAction };

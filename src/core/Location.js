import createHistory from 'history/lib/createBrowserHistory';
import createMemoryHistory from 'history/lib/createMemoryHistory';
import useQueries from 'history/lib/useQueries';

// noinspection ES6ModulesDependencies
const location = useQueries(process.env.BROWSER ? createHistory : createMemoryHistory)();

export default location;

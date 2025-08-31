import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import { fetchCO2Data } from './store/slices/countriesReducer';
import BasicDataTable from './components/dataTables/BasicDataTable';
import Loading from './Loading/Loading';
import { Suspense } from 'react';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useSelector((state: RootState) => state.countries);

  useEffect(() => {
    dispatch(fetchCO2Data());
  }, [dispatch]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="App">
        <BasicDataTable />
      </div>
    </Suspense>
  );
}

export default App;
